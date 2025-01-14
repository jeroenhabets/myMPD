/*
 SPDX-License-Identifier: GPL-3.0-or-later
 myMPD (c) 2018-2021 Juergen Mang <mail@jcgames.de>
 https://github.com/jcorporation/mympd
*/

#ifndef MYMPD_WEB_SERVER_TAGART_H
#define MYMPD_WEB_SERVER_TAGART_H

#include <stdbool.h>

#include "../../dist/src/mongoose/mongoose.h"
#include "../../dist/src/sds/sds.h"
#include "web_server_utility.h"

bool webserver_tagart_handler(struct mg_connection *nc, struct mg_http_message *hm, struct t_mg_user_data *mg_user_data);
#endif
