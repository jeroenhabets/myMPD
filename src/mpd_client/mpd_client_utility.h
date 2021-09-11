/*
 SPDX-License-Identifier: GPL-2.0-or-later
 myMPD (c) 2018-2021 Juergen Mang <mail@jcgames.de>
 https://github.com/jcorporation/mympd
*/

#ifndef MYMPD_MPD_CLIENT_UTILITY_H
#define MYMPD_MPD_CLIENT_UTILITY_H

#include "../lib/mympd_state.h"

#include <stdbool.h>

bool is_smartpls(struct t_mympd_state *mympd_state, sds playlist);
bool is_streamuri(const char *uri);
sds get_extra_files(struct t_mympd_state *mympd_state, sds buffer, const char *uri, bool is_dirname);
bool mpd_client_set_binarylimit(struct t_mympd_state *mympd_state);
unsigned mpd_client_get_elapsed_seconds(struct mpd_status *status);
#endif
