/*
 SPDX-License-Identifier: GPL-3.0-or-later
 myMPD (c) 2018-2021 Juergen Mang <mail@jcgames.de>
 https://github.com/jcorporation/mympd
*/

#include "mympd_config_defs.h"
#include "mympd_api_queue.h"

#include "../lib/jsonrpc.h"
#include "../lib/log.h"
#include "../mpd_shared.h"
#include "../mpd_shared/mpd_shared_sticker.h"
#include "../mpd_shared/mpd_shared_tags.h"

//private definitions
static sds _mympd_api_get_queue_state(struct mpd_status *status, sds buffer);

//public
bool mympd_api_queue_prio_set_highest(struct t_mympd_state *mympd_state, const unsigned trackid) {
    //default prio is 10
    unsigned priority = 10;
    
    //try to get prio of next song
    struct mpd_status *status = mpd_run_status(mympd_state->mpd_state->conn);
    if (status == NULL) {
        check_error_and_recover(mympd_state->mpd_state, NULL, NULL, 0);
        return false;
    }
    int next_song_id = mpd_status_get_next_song_id(status);
    mpd_status_free(status);
    if (next_song_id > -1 ) {
        bool rc = mpd_send_get_queue_song_id(mympd_state->mpd_state->conn, next_song_id);
        if (rc == true) {
            struct mpd_song *song = mpd_recv_song(mympd_state->mpd_state->conn);
            if (song != NULL) {
                priority = mpd_song_get_prio(song);
                priority++;
                mpd_song_free(song);
            }
        }
        mpd_response_finish(mympd_state->mpd_state->conn);
        if (check_rc_error_and_recover(mympd_state->mpd_state, NULL, NULL, 0, false, rc, "mpd_send_get_queue_song_id") == false) {
            return false;
        }
    }
    
    //set priority, priority have only an effect in random mode
    bool rc = mpd_run_prio_id(mympd_state->mpd_state->conn, (int)priority, trackid);
    if (check_rc_error_and_recover(mympd_state->mpd_state, NULL, NULL, 0, false, rc, "mpd_run_prio_id") == false) {
        return false;
    }
    return true;
}

bool mympd_api_queue_replace_with_song(struct t_mympd_state *mympd_state, const char *uri) {
    if (mpd_command_list_begin(mympd_state->mpd_state->conn, false)) {
        bool rc = mpd_send_clear(mympd_state->mpd_state->conn);
        if (rc == false) {
            MYMPD_LOG_ERROR("Error adding command to command list mpd_send_clear");
        }
        rc = mpd_send_add(mympd_state->mpd_state->conn, uri);
        if (rc == false) {
            MYMPD_LOG_ERROR("Error adding command to command list mpd_send_add");
        }
        rc = mpd_send_play(mympd_state->mpd_state->conn);
        if (rc == false) {
            MYMPD_LOG_ERROR("Error adding command to command list mpd_send_play");
        }
        if (mpd_command_list_end(mympd_state->mpd_state->conn) == true) {
            mpd_response_finish(mympd_state->mpd_state->conn);
        }
    }
    if (check_error_and_recover2(mympd_state->mpd_state, NULL, NULL, 0, false) == false) {
        return false;
    }
    return true;
}

bool mympd_api_queue_replace_with_playlist(struct t_mympd_state *mympd_state, const char *plist) {
    if (mpd_command_list_begin(mympd_state->mpd_state->conn, false)) {
        mpd_send_clear(mympd_state->mpd_state->conn);
        mpd_send_load(mympd_state->mpd_state->conn, plist);
        mpd_send_play(mympd_state->mpd_state->conn);
        if (mpd_command_list_end(mympd_state->mpd_state->conn) == true) {
            mpd_response_finish(mympd_state->mpd_state->conn);
        }
    }
    if (check_error_and_recover2(mympd_state->mpd_state, NULL, NULL, 0, false) == false) {
        return false;
    }
    return true;
}

sds mympd_api_queue_status(struct t_mympd_state *mympd_state, sds buffer) {
    struct mpd_status *status = mpd_run_status(mympd_state->mpd_state->conn);
    if (status == NULL) {
        check_error_and_recover(mympd_state->mpd_state, NULL, NULL, 0);
        return buffer;
    }

    mympd_state->mpd_state->queue_version = mpd_status_get_queue_version(status);
    mympd_state->mpd_state->queue_length = mpd_status_get_queue_length(status);
    mympd_state->mpd_state->crossfade = mpd_status_get_crossfade(status);
    mympd_state->mpd_state->state = mpd_status_get_state(status);

    if (buffer != NULL) {
        buffer = _mympd_api_get_queue_state(status, buffer);
    }
    mpd_status_free(status);
    return buffer;
}

static sds _mympd_api_get_queue_state(struct mpd_status *status, sds buffer) {
    buffer = jsonrpc_notify_start(buffer, "update_queue");
    buffer = tojson_long(buffer, "state", mpd_status_get_state(status), true);
    buffer = tojson_long(buffer, "queueLength", mpd_status_get_queue_length(status), true);
    buffer = tojson_long(buffer, "queueVersion", mpd_status_get_queue_version(status), true);
    buffer = tojson_long(buffer, "songPos", mpd_status_get_song_pos(status), true);
    buffer = tojson_long(buffer, "nextSongPos", mpd_status_get_next_song_pos(status), false);
    buffer = jsonrpc_result_end(buffer);
    return buffer;
}

sds mympd_api_queue_list(struct t_mympd_state *mympd_state, sds buffer, sds method, long request_id,
                         unsigned int offset, unsigned int limit, const struct t_tags *tagcols)
{
    struct mpd_status *status = mpd_run_status(mympd_state->mpd_state->conn);
    if (status == NULL) {
        buffer = check_error_and_recover(mympd_state->mpd_state, buffer, method, request_id);
        return buffer;
    }

    if (offset >= mpd_status_get_queue_length(status)) {
        offset = 0;
    }

    unsigned real_limit = limit == 0 ? offset + MPD_RESULTS_MAX : offset + limit;
        
    bool rc = mpd_send_list_queue_range_meta(mympd_state->mpd_state->conn, offset, real_limit);
    if (check_rc_error_and_recover(mympd_state->mpd_state, &buffer, method, request_id, false, rc, "mpd_send_list_queue_range_meta") == false) {
        return buffer;
    }
        
    buffer = jsonrpc_result_start(buffer, method, request_id);
    buffer = sdscat(buffer, "\"data\":[");
    unsigned total_time = 0;
    unsigned entity_count = 0;
    unsigned entities_returned = 0;
    struct mpd_song *song;
    while ((song = mpd_recv_song(mympd_state->mpd_state->conn)) != NULL) {
        total_time += mpd_song_get_duration(song);
        entity_count++;
        if (entities_returned++) {
            buffer = sdscatlen(buffer, ",", 1);
        }
        buffer = sdscatlen(buffer, "{", 1);
        buffer = tojson_long(buffer, "id", mpd_song_get_id(song), true);
        buffer = tojson_long(buffer, "Pos", mpd_song_get_pos(song), true);
        buffer = get_song_tags(buffer, mympd_state->mpd_state, tagcols, song);
        if (mympd_state->mpd_state->feat_stickers == true && mympd_state->sticker_cache != NULL) {
            buffer = sdscat(buffer, ",");
            buffer = mpd_shared_sticker_list(buffer, mympd_state->sticker_cache, mpd_song_get_uri(song));
        }
        buffer = sdscatlen(buffer, "}", 1);
        mpd_song_free(song);
    }

    buffer = sdscatlen(buffer, "],", 2);
    buffer = tojson_long(buffer, "totalTime", total_time, true);
    buffer = tojson_long(buffer, "totalEntities", mpd_status_get_queue_length(status), true);
    buffer = tojson_long(buffer, "offset", offset, true);
    buffer = tojson_long(buffer, "returnedEntities", entities_returned, true);
    buffer = tojson_long(buffer, "queueVersion", mpd_status_get_queue_version(status), false);
    buffer = jsonrpc_result_end(buffer);
    
    mympd_state->mpd_state->queue_version = mpd_status_get_queue_version(status);
    mympd_state->mpd_state->queue_length = mpd_status_get_queue_length(status);
    mpd_status_free(status);

    mpd_response_finish(mympd_state->mpd_state->conn);
    if (check_error_and_recover2(mympd_state->mpd_state, &buffer, method, request_id, false) == false) {
        return buffer;
    }
    
    return buffer;
}

sds mympd_api_queue_crop(struct t_mympd_state *mympd_state, sds buffer, sds method, long request_id, bool or_clear) {
    struct mpd_status *status = mpd_run_status(mympd_state->mpd_state->conn);
    if (status == NULL) {
        buffer = check_error_and_recover(mympd_state->mpd_state, buffer, method, request_id);
        return buffer;
    }
    const unsigned length = mpd_status_get_queue_length(status) - 1;
    unsigned playing_song_pos = mpd_status_get_song_pos(status);
    enum mpd_state state = mpd_status_get_state(status);

    if ((state == MPD_STATE_PLAY || state == MPD_STATE_PAUSE) && length > 1) {
        playing_song_pos++;
        if (playing_song_pos < length) {
            bool rc = mpd_run_delete_range(mympd_state->mpd_state->conn, playing_song_pos, -1);
            if (check_rc_error_and_recover(mympd_state->mpd_state, &buffer, method, request_id, false, rc, "mpd_run_delete_range") == false) {
                return buffer;
            }
        }
        playing_song_pos--;
        if (playing_song_pos > 0) {
            bool rc = mpd_run_delete_range(mympd_state->mpd_state->conn, 0, playing_song_pos--);
            if (check_rc_error_and_recover(mympd_state->mpd_state, &buffer, method, request_id, false, rc, "mpd_run_delete_range") == false) {
                return buffer;
            }
        }
        buffer = jsonrpc_respond_ok(buffer, method, request_id, "queue");
    }
    else if (or_clear == true || state == MPD_STATE_STOP) {
        bool rc = mpd_run_clear(mympd_state->mpd_state->conn);
        if (check_rc_error_and_recover(mympd_state->mpd_state, &buffer, method, request_id, false, rc, "mpd_run_clear") == true) {
            buffer = jsonrpc_respond_ok(buffer, method, request_id, "queue");
        }
    }
    else {
        buffer = jsonrpc_respond_message(buffer, method, request_id, true, "queue", "error", "Can not crop the queue");
        MYMPD_LOG_ERROR("Can not crop the queue");
    }
    
    mpd_status_free(status);
    
    return buffer;
}

sds mympd_api_queue_search(struct t_mympd_state *mympd_state, sds buffer, sds method, long request_id,
                            const char *mpdtagtype, const unsigned int offset, const unsigned int limit, const char *searchstr, const struct t_tags *tagcols)
{
    bool rc = mpd_search_queue_songs(mympd_state->mpd_state->conn, false);
    if (check_rc_error_and_recover(mympd_state->mpd_state, &buffer, method, request_id, false, rc, "mpd_search_queue_songs") == false) {
        mpd_search_cancel(mympd_state->mpd_state->conn);
        return buffer;
    }
    if (mpd_tag_name_parse(mpdtagtype) != MPD_TAG_UNKNOWN) {
        rc = mpd_search_add_tag_constraint(mympd_state->mpd_state->conn, MPD_OPERATOR_DEFAULT, mpd_tag_name_parse(mpdtagtype), searchstr);
        if (check_rc_error_and_recover(mympd_state->mpd_state, &buffer, method, request_id, false, rc, "mpd_search_add_tag_constraint") == false) {
            mpd_search_cancel(mympd_state->mpd_state->conn);
            return buffer;
        }        
    }
    else {
        rc = mpd_search_add_any_tag_constraint(mympd_state->mpd_state->conn, MPD_OPERATOR_DEFAULT, searchstr);
        if (check_rc_error_and_recover(mympd_state->mpd_state, &buffer, method, request_id, false, rc, "mpd_search_add_any_tag_constraint") == false) {
            mpd_search_cancel(mympd_state->mpd_state->conn);
            return buffer;
        }
    }

    rc = mpd_search_commit(mympd_state->mpd_state->conn);
    if (check_rc_error_and_recover(mympd_state->mpd_state, &buffer, method, request_id, false, rc, "mpd_search_commit") == false) {
        return buffer;
    }
    
    buffer = jsonrpc_result_start(buffer, method, request_id);
    buffer = sdscat(buffer, "\"data\":[");
    struct mpd_song *song;
    unsigned entity_count = 0;
    unsigned entities_returned = 0;
    unsigned real_limit = limit == 0 ? offset + MPD_RESULTS_MAX : offset + limit;
    while ((song = mpd_recv_song(mympd_state->mpd_state->conn)) != NULL) {
        entity_count++;
        if (entity_count > offset && entity_count <= real_limit) {
            if (entities_returned++) {
                buffer= sdscatlen(buffer, ",", 1);
            }
            buffer = sdscatlen(buffer, "{", 1);
            buffer = tojson_long(buffer, "id", mpd_song_get_id(song), true);
            buffer = tojson_long(buffer, "Pos", mpd_song_get_pos(song), true);
            buffer = get_song_tags(buffer, mympd_state->mpd_state, tagcols, song);
            if (mympd_state->mpd_state->feat_stickers == true && mympd_state->sticker_cache != NULL) {
                buffer= sdscatlen(buffer, ",", 1);
                buffer = mpd_shared_sticker_list(buffer, mympd_state->sticker_cache, mpd_song_get_uri(song));
            }
            buffer = sdscatlen(buffer, "}", 1);
        }
        mpd_song_free(song);
    }

    buffer = sdscatlen(buffer, "],", 2);
    buffer = tojson_long(buffer, "totalEntities", entity_count, true);
    buffer = tojson_long(buffer, "offset", offset, true);
    buffer = tojson_long(buffer, "returnedEntities", entities_returned, true);
    buffer = tojson_char(buffer, "mpdtagtype", mpdtagtype, false);
    buffer = jsonrpc_result_end(buffer);
    
    mpd_response_finish(mympd_state->mpd_state->conn);
    if (check_error_and_recover2(mympd_state->mpd_state, &buffer, method, request_id, false) == false) {
        return buffer;
    }
    
    return buffer;
}
