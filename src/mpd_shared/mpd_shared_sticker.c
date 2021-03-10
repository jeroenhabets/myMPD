/*
 SPDX-License-Identifier: GPL-2.0-or-later
 myMPD (c) 2018-2021 Juergen Mang <mail@jcgames.de>
 https://github.com/jcorporation/mympd
*/

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <inttypes.h>
#include <limits.h>
#include <time.h>
#include <assert.h>
#include <mpd/client.h>

#include "../../dist/src/rax/rax.h"
#include "../../dist/src/sds/sds.h"
#include "../sds_extras.h"
#include "../api.h"
#include "../log.h"
#include "../list.h"
#include "mympd_config_defs.h"
#include "../utility.h"
#include "mpd_shared_typedefs.h"
#include "../mpd_shared.h"
#include "mpd_shared_sticker.h"

sds mpd_shared_sticker_list(sds buffer, rax *sticker_cache, const char *uri) {
    t_sticker *sticker = get_sticker_from_cache(sticker_cache, uri);
    if (sticker != NULL) {
        buffer = tojson_long(buffer, "stickerPlayCount", sticker->playCount, true);
        buffer = tojson_long(buffer, "stickerSkipCount", sticker->skipCount, true);
        buffer = tojson_long(buffer, "stickerLike", sticker->like, true);
        buffer = tojson_long(buffer, "stickerLastPlayed", sticker->lastPlayed, true);
        buffer = tojson_long(buffer, "stickerLastSkipped", sticker->lastSkipped, false);
    }
    else {
        buffer = tojson_long(buffer, "stickerPlayCount", 0, true);
        buffer = tojson_long(buffer, "stickerSkipCount", 0, true);
        buffer = tojson_long(buffer, "stickerLike", 1, true);
        buffer = tojson_long(buffer, "stickerLastPlayed", 0, true);
        buffer = tojson_long(buffer, "stickerLastSkipped", 0, false);
    }
    return buffer;
}

struct t_sticker *get_sticker_from_cache(rax *sticker_cache, const char *uri) {
    if (sticker_cache == NULL) {
        return NULL;
    }
    void *data = raxFind(sticker_cache, (unsigned char*)uri, strlen(uri));
    if (data == raxNotFound) {
        return NULL;
    }
    t_sticker *sticker = (t_sticker *) data;
    return sticker;
}

bool mpd_shared_get_sticker(t_mpd_state *mpd_state, const char *uri, t_sticker *sticker) {
    struct mpd_pair *pair;
    char *crap = NULL;
    sticker->playCount = 0;
    sticker->skipCount = 0;
    sticker->lastPlayed = 0;
    sticker->lastSkipped = 0;
    sticker->like = 1;

    if (is_streamuri(uri) == true) {
        return false;
    }

    bool rc = mpd_send_sticker_list(mpd_state->conn, "song", uri);
    if (check_rc_error_and_recover(mpd_state, NULL, NULL, 0, false, rc, "mpd_send_sticker_list") == false) {
        return false;
    }

    while ((pair = mpd_recv_sticker(mpd_state->conn)) != NULL) {
        if (strcmp(pair->name, "playCount") == 0) {
            sticker->playCount = strtoimax(pair->value, &crap, 10);
        }
        else if (strcmp(pair->name, "skipCount") == 0) {
            sticker->skipCount = strtoimax(pair->value, &crap, 10);
        }
        else if (strcmp(pair->name, "lastPlayed") == 0) {
            sticker->lastPlayed = strtoimax(pair->value, &crap, 10);
        }
        else if (strcmp(pair->name, "lastSkipped") == 0) {
            sticker->lastSkipped = strtoimax(pair->value, &crap, 10);
        }
        else if (strcmp(pair->name, "like") == 0) {
            sticker->like = strtoimax(pair->value, &crap, 10);
        }
        mpd_return_sticker(mpd_state->conn, pair);
    }
    mpd_response_finish(mpd_state->conn);
    if (check_error_and_recover2(mpd_state, NULL, NULL, 0, false) == false) {
        return false;
    }

    return true;
}

void sticker_cache_free(rax **sticker_cache) {
    if (*sticker_cache == NULL) {
        MYMPD_LOG_DEBUG("Sticker cache is NULL not freeing anything");
        return;
    }
    raxIterator iter;
    raxStart(&iter, *sticker_cache);
    raxSeek(&iter, "^", NULL, 0);
    while (raxNext(&iter)) {
        FREE_PTR(iter.data);
    }
    raxStop(&iter);
    raxFree(*sticker_cache);
    *sticker_cache = NULL;
}
