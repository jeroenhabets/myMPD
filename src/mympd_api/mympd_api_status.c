/*
 SPDX-License-Identifier: GPL-3.0-or-later
 myMPD (c) 2018-2021 Juergen Mang <mail@jcgames.de>
 https://github.com/jcorporation/mympd
*/

#include "mympd_config_defs.h"
#include "mympd_api_status.h"

#include "../lib/jsonrpc.h"
#include "../lib/log.h"
#include "../lib/lua_mympd_state.h"
#include "../lib/mympd_configuration.h"
#include "../lib/sds_extras.h"
#include "../mpd_shared.h"
#include "../mpd_shared/mpd_shared_sticker.h"
#include "../mpd_shared/mpd_shared_tags.h"
#include "mympd_api_utility.h"

//private definitions
static sds _mympd_api_get_outputs(struct t_mympd_state *mympd_state, sds buffer, sds method, long request_id);
static int _mympd_api_get_volume(struct t_mympd_state *mympd_state);
static unsigned get_current_song_start_time(struct t_mympd_state *mympd_state);

//public functions
sds mympd_api_status_updatedb_state(struct t_mympd_state *mympd_state, sds buffer) {
    long update_id = mympd_api_status_updatedb_id(mympd_state);
    if (update_id == -1) {
        buffer = jsonrpc_notify(buffer, "mpd", "error", "Error getting MPD status");
    }
    else if (update_id > 0) {
        buffer = jsonrpc_notify_start(buffer, "update_started");
        buffer = tojson_long(buffer, "jobid", update_id, false);
        buffer = jsonrpc_result_end(buffer);
    }
    else {
        buffer = jsonrpc_event(buffer, "update_finished");
    }
    return buffer;    
}

long mympd_api_status_updatedb_id(struct t_mympd_state *mympd_state) {
    struct mpd_status *status = mpd_run_status(mympd_state->mpd_state->conn);
    if (status == NULL) {
        check_error_and_recover_notify(mympd_state->mpd_state, NULL);
        return -1;
    }
    unsigned update_id = mpd_status_get_update_id(status);
    MYMPD_LOG_NOTICE("Update database ID: %u", update_id);
    mpd_status_free(status);    
    mpd_response_finish(mympd_state->mpd_state->conn);
    check_error_and_recover2(mympd_state->mpd_state, NULL, NULL, 0, false);
    return update_id;
}

sds mympd_api_status_get(struct t_mympd_state *mympd_state, sds buffer, sds method, long request_id) {
    struct mpd_status *status = mpd_run_status(mympd_state->mpd_state->conn);
    if (status == NULL) {
        if (method == NULL) {
            buffer = check_error_and_recover_notify(mympd_state->mpd_state, buffer);
        }
        else {
            buffer = check_error_and_recover(mympd_state->mpd_state, buffer, method, request_id);
        }
        return buffer;
    }

    int song_id = mpd_status_get_song_id(status);
    if (mympd_state->mpd_state->song_id != song_id) {
        mympd_state->mpd_state->last_song_id = mympd_state->mpd_state->song_id;
        mympd_state->mpd_state->last_song_end_time = mympd_state->mpd_state->song_end_time;
        mympd_state->mpd_state->last_song_start_time = mympd_state->mpd_state->song_start_time;
        mympd_state->mpd_state->last_song_set_song_played_time = mympd_state->mpd_state->set_song_played_time;
        struct mpd_song *song = mpd_run_current_song(mympd_state->mpd_state->conn);
        if (song != NULL) {
            mympd_state->mpd_state->last_song_uri = sds_replace(mympd_state->mpd_state->last_song_uri, mympd_state->mpd_state->song_uri);
            mympd_state->mpd_state->song_uri = sds_replace(mympd_state->mpd_state->song_uri, mpd_song_get_uri(song));
            mpd_song_free(song);
        }
        else {
            sdsclear(mympd_state->mpd_state->song_uri);
        }
        mpd_response_finish(mympd_state->mpd_state->conn);
        check_error_and_recover2(mympd_state->mpd_state, NULL, NULL, 0, false);
    }

    mympd_state->mpd_state->state = mpd_status_get_state(status);
    mympd_state->mpd_state->song_id = song_id;
    mympd_state->mpd_state->next_song_id = mpd_status_get_next_song_id(status);
    mympd_state->mpd_state->queue_version = mpd_status_get_queue_version(status);
    mympd_state->mpd_state->queue_length = mpd_status_get_queue_length(status);
    mympd_state->mpd_state->crossfade = mpd_status_get_crossfade(status);

    const unsigned total_time = mpd_status_get_total_time(status);
    const unsigned elapsed_time =  mympd_api_get_elapsed_seconds(status);
    unsigned uptime = time(NULL) - mympd_state->config->startup_time;
    if (total_time > 10 && uptime > elapsed_time) {
        time_t now = time(NULL);
        mympd_state->mpd_state->song_end_time = now + total_time - elapsed_time - 10;
        mympd_state->mpd_state->song_start_time = now - elapsed_time;
        unsigned half_time = total_time / 2;
        
        if (half_time > 240) {
            mympd_state->mpd_state->set_song_played_time = now - elapsed_time + 240;
        }
        else {
            mympd_state->mpd_state->set_song_played_time = elapsed_time < half_time ? now - (long)elapsed_time + (long)half_time : now;
        }
    }
    else {
        //don't track songs with length < 10s
        mympd_state->mpd_state->song_end_time = 0;
        mympd_state->mpd_state->song_start_time = 0;
        mympd_state->mpd_state->set_song_played_time = 0;
    }
    
    if (method == NULL) {
        buffer = jsonrpc_notify_start(buffer, "update_state");
    }
    else {
        buffer = jsonrpc_result_start(buffer, method, request_id);
    }
    const struct mpd_audio_format *audioformat = mpd_status_get_audio_format(status);
    buffer = tojson_long(buffer, "state", mpd_status_get_state(status), true);
    buffer = tojson_long(buffer, "volume", mpd_status_get_volume(status), true);
    buffer = tojson_long(buffer, "songPos", mpd_status_get_song_pos(status), true);
    buffer = tojson_long(buffer, "elapsedTime", mympd_api_get_elapsed_seconds(status), true);
    buffer = tojson_long(buffer, "totalTime", mpd_status_get_total_time(status), true);
    buffer = tojson_long(buffer, "currentSongId", mpd_status_get_song_id(status), true);
    buffer = tojson_long(buffer, "kbitrate", mpd_status_get_kbit_rate(status), true);
    buffer = tojson_long(buffer, "queueLength", mpd_status_get_queue_length(status), true);
    buffer = tojson_long(buffer, "queueVersion", mpd_status_get_queue_version(status), true);
    buffer = tojson_long(buffer, "nextSongPos", mpd_status_get_next_song_pos(status), true);
    buffer = tojson_long(buffer, "nextSongId", mpd_status_get_next_song_id(status), true);
    buffer = tojson_long(buffer, "lastSongId", (mympd_state->mpd_state->last_song_id ? 
        mympd_state->mpd_state->last_song_id : -1), true);
    if (mympd_state->mpd_state->feat_mpd_partitions == true) {
        buffer = tojson_char(buffer, "partition", mpd_status_get_partition(status), true);
    }
    buffer = sdscat(buffer, "\"audioFormat\":{");
    buffer = tojson_long(buffer, "sampleRate", (audioformat ? audioformat->sample_rate : 0), true);
    buffer = tojson_long(buffer, "bits", (audioformat ? audioformat->bits : 0), true);
    buffer = tojson_long(buffer, "channels", (audioformat ? audioformat->channels : 0), false);
    buffer = sdscatlen(buffer, "},", 2);
    buffer = tojson_char(buffer, "lastError", mpd_status_get_error(status), false);
    buffer = jsonrpc_result_end(buffer);

    mpd_status_free(status);
    return buffer;
}

bool mympd_api_status_lua_mympd_state_set(struct t_mympd_state *mympd_state, struct t_list *lua_mympd_state) {
    struct mpd_status *status = mpd_run_status(mympd_state->mpd_state->conn);
    if (status == NULL) {
        return false;
    }
    lua_mympd_state_set_i(lua_mympd_state, "play_state", mpd_status_get_state(status));
    lua_mympd_state_set_i(lua_mympd_state, "volume", mpd_status_get_volume(status));
    lua_mympd_state_set_i(lua_mympd_state, "song_pos", mpd_status_get_song_pos(status));
    lua_mympd_state_set_i(lua_mympd_state, "elapsed_time", mympd_api_get_elapsed_seconds(status));
    lua_mympd_state_set_i(lua_mympd_state, "total_time", mpd_status_get_total_time(status));
    lua_mympd_state_set_i(lua_mympd_state, "song_id", mpd_status_get_song_id(status));
    lua_mympd_state_set_i(lua_mympd_state, "next_song_id", mpd_status_get_next_song_id(status));
    lua_mympd_state_set_i(lua_mympd_state, "next_song_pos", mpd_status_get_next_song_pos(status));
    lua_mympd_state_set_i(lua_mympd_state, "queue_length", mpd_status_get_queue_length(status));
    lua_mympd_state_set_i(lua_mympd_state, "queue_version", mpd_status_get_queue_version(status));
    lua_mympd_state_set_b(lua_mympd_state, "repeat", mpd_status_get_repeat(status));
    lua_mympd_state_set_b(lua_mympd_state, "random", mpd_status_get_random(status));
    lua_mympd_state_set_i(lua_mympd_state, "single_state", mpd_status_get_single_state(status));
    lua_mympd_state_set_i(lua_mympd_state, "consume", mpd_status_get_consume(status));
    lua_mympd_state_set_i(lua_mympd_state, "crossfade", mpd_status_get_crossfade(status));
    lua_mympd_state_set_p(lua_mympd_state, "music_directory", mympd_state->music_directory_value);
    lua_mympd_state_set_p(lua_mympd_state, "workdir", mympd_state->config->workdir);
    lua_mympd_state_set_i(lua_mympd_state, "jukebox_mode", mympd_state->jukebox_mode);
    lua_mympd_state_set_p(lua_mympd_state, "jukebox_playlist", mympd_state->jukebox_playlist);
    lua_mympd_state_set_i(lua_mympd_state, "jukebox_queue_length", mympd_state->jukebox_queue_length);
    lua_mympd_state_set_i(lua_mympd_state, "jukebox_last_played", mympd_state->jukebox_last_played);
    if (mympd_state->mpd_state->feat_mpd_partitions == true) {
        lua_mympd_state_set_p(lua_mympd_state, "partition", mpd_status_get_partition(status));
    }
    mpd_status_free(status);
    mpd_response_finish(mympd_state->mpd_state->conn);
    check_error_and_recover2(mympd_state->mpd_state, NULL, NULL, 0, false);
    lua_mympd_state_set_p(lua_mympd_state, "jukebox_unique_tag", mpd_tag_name(mympd_state->jukebox_unique_tag.tags[0]));
    return true;
}

sds mympd_api_status_volume_get(struct t_mympd_state *mympd_state, sds buffer, sds method, long request_id) {
    int volume = _mympd_api_get_volume(mympd_state);
    if (method == NULL) {
        buffer = jsonrpc_notify_start(buffer, "update_volume");
    }
    else {
        buffer = jsonrpc_result_start(buffer, method, request_id);
    }
    buffer = tojson_long(buffer, "volume", volume, false);
    buffer = jsonrpc_result_end(buffer);
    return buffer;
}

sds mympd_api_status_partition_output_list(struct t_mympd_state *mympd_state, sds buffer, sds method, long request_id,
                                     const char *partition)
{
    struct mpd_status *status = mpd_run_status(mympd_state->mpd_state->conn);
    const char *oldpartition = mpd_status_get_partition(status);
    bool rc = mpd_run_switch_partition(mympd_state->mpd_state->conn, partition);
    if (check_rc_error_and_recover(mympd_state->mpd_state, &buffer, method, request_id, false, rc, "mpd_run_switch_partition") == false) {
        mpd_status_free(status);
        return buffer;
    }

    buffer = _mympd_api_get_outputs(mympd_state, buffer, method, request_id);
    
    rc = mpd_run_switch_partition(mympd_state->mpd_state->conn, oldpartition);
    check_rc_error_and_recover(mympd_state->mpd_state, &buffer, method, request_id, false, rc, "mpd_run_switch_partition");
    mpd_status_free(status);
    return buffer;
}

sds mympd_api_status_output_list(struct t_mympd_state *mympd_state, sds buffer, sds method, long request_id) {
    return _mympd_api_get_outputs(mympd_state, buffer, method, request_id);
}

sds mympd_api_status_current_song(struct t_mympd_state *mympd_state, sds buffer, sds method, long request_id) {
    struct mpd_song *song = mpd_run_current_song(mympd_state->mpd_state->conn);
    if (song == NULL) {
        if (check_error_and_recover2(mympd_state->mpd_state, &buffer, method, request_id, false) == false) {
            return buffer;
        }
        buffer = jsonrpc_respond_message(buffer, method, request_id, false, "player", "info", "No current song");
        return buffer;
    }
    
    const char *uri = mpd_song_get_uri(song);

    buffer = jsonrpc_result_start(buffer, method, request_id);
    buffer = tojson_long(buffer, "pos", mpd_song_get_pos(song), true);
    buffer = tojson_long(buffer, "currentSongId", mympd_state->mpd_state->song_id, true);
    buffer = get_song_tags(buffer, mympd_state->mpd_state, &mympd_state->mpd_state->tag_types_mympd, song);
    if (mympd_state->mpd_state->feat_stickers && mympd_state->sticker_cache != NULL) {
        buffer = sdscatlen(buffer, ",", 1);
        buffer = mpd_shared_sticker_list(buffer, mympd_state->sticker_cache, mpd_song_get_uri(song));
    }
    buffer = sdscatlen(buffer, ",", 1);
    buffer = get_extra_files(mympd_state, buffer, uri, false);
    mpd_song_free(song);

    mpd_response_finish(mympd_state->mpd_state->conn);
    if (check_error_and_recover2(mympd_state->mpd_state, &buffer, method, request_id, false) == false) {
        return buffer;
    }
    buffer = sdscatlen(buffer, ",", 1);
    unsigned start_time = get_current_song_start_time(mympd_state);
    buffer = tojson_long(buffer, "startTime", start_time, false);
    buffer = jsonrpc_result_end(buffer);
    return buffer;
}

//private functions
static unsigned get_current_song_start_time(struct t_mympd_state *mympd_state) {
    if (mympd_state->mpd_state->song_start_time > 0) {
        return mympd_state->mpd_state->song_start_time;
    }
    struct mpd_status *status = mpd_run_status(mympd_state->mpd_state->conn);
    if (status == NULL) {
        mpd_response_finish(mympd_state->mpd_state->conn);
        check_error_and_recover2(mympd_state->mpd_state, NULL, NULL, 0, false);
        return 0;
    }
    const unsigned start_time = time(NULL) - mympd_api_get_elapsed_seconds(status);
    mpd_status_free(status);    
    mpd_response_finish(mympd_state->mpd_state->conn);
    check_error_and_recover2(mympd_state->mpd_state, NULL, NULL, 0, false);
    return start_time;
}

static sds _mympd_api_get_outputs(struct t_mympd_state *mympd_state, sds buffer, sds method, long request_id) {
    bool rc = mpd_send_outputs(mympd_state->mpd_state->conn);
    if (check_rc_error_and_recover(mympd_state->mpd_state, &buffer, method, request_id, false, rc, "mpd_send_outputs") == false) {
        return buffer;
    }

    buffer = jsonrpc_result_start(buffer, method, request_id);
    buffer = sdscat(buffer, "\"data\":[");
    int nr = 0;
    struct mpd_output *output;
    while ((output = mpd_recv_output(mympd_state->mpd_state->conn)) != NULL) {
        if (nr++) {
            buffer = sdscatlen(buffer, ",", 1);
        }
        buffer = sdscatlen(buffer, "{", 1);
        buffer = tojson_long(buffer, "id", mpd_output_get_id(output), true);
        buffer = tojson_char(buffer, "name", mpd_output_get_name(output), true);
        buffer = tojson_long(buffer, "state", mpd_output_get_enabled(output), true);
        buffer = tojson_char(buffer, "plugin", mpd_output_get_plugin(output), true);
        buffer = sdscat(buffer,  "\"attributes\":{");
        const struct mpd_pair *attributes = mpd_output_first_attribute(output);
        if (attributes != NULL) {
            buffer = tojson_char(buffer, attributes->name, attributes->value, false);
            while ((attributes = mpd_output_next_attribute(output)) != NULL) {
                buffer = sdscatlen(buffer, ",", 1);
                buffer = tojson_char(buffer, attributes->name, attributes->value, false);
            }
        }
        buffer = sdscatlen(buffer, "}}", 2);
        mpd_output_free(output);
    }
    mpd_response_finish(mympd_state->mpd_state->conn);
    if (check_error_and_recover2(mympd_state->mpd_state, &buffer, method, request_id, false) == false) {
        return buffer;
    }

    buffer = sdscatlen(buffer, "],", 2);
    buffer = tojson_long(buffer, "numOutputs", nr, false);
    buffer = jsonrpc_result_end(buffer);
    
    return buffer;
}

static int _mympd_api_get_volume(struct t_mympd_state *mympd_state) {
    int volume = -1;
    if (mpd_connection_cmp_server_version(mympd_state->mpd_state->conn, 0, 23, 0) >= 0) {
        volume = mpd_run_get_volume(mympd_state->mpd_state->conn);
        check_error_and_recover(mympd_state->mpd_state, NULL, NULL, 0);
    }
    else {
        struct mpd_status *status = mpd_run_status(mympd_state->mpd_state->conn);
        if (status == NULL) {
            check_error_and_recover(mympd_state->mpd_state, NULL, NULL, 0);
            return -1;
        }
        volume = mpd_status_get_volume(status);
        mpd_status_free(status);
    }
    mpd_response_finish(mympd_state->mpd_state->conn);
    check_error_and_recover2(mympd_state->mpd_state, NULL, NULL, 0, false);
    return volume;
}
