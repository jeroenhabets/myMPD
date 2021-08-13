/*
 SPDX-License-Identifier: GPL-2.0-or-later
 myMPD (c) 2018-2021 Juergen Mang <mail@jcgames.de>
 https://github.com/jcorporation/mympd
*/

#ifndef MYMPD_CONFIG_H
#define MYMPD_CONFIG_H

#include "lib/mympd_configuration.h"
#include "mympd_config_defs.h"

#include <stdbool.h>

void mympd_config_defaults_initial(struct t_config *config);
void mympd_config_defaults(struct t_config *config);
void mympd_free_config_initial(struct t_config *config);
void mympd_free_config(struct t_config *config);
bool mympd_read_config(struct t_config *config);
void mympd_autoconf(struct t_config *config);
#endif
