"use strict";
// SPDX-License-Identifier: GPL-3.0-or-later
// myMPD (c) 2018-2021 Juergen Mang <mail@jcgames.de>
// https://github.com/jcorporation/mympd

const APIparams = {
    "offset": {
            "type": "uint",
            "example": 0,
            "desc": "start offset of the returned list"
    },
    "limit": {
        "type": "uint",
        "example": 50,
        "desc": "maximum number of elements to return"
    },
    "sort": {
        "type": "text",
        "example": "Title",
        "desc": "tag to sort the result"
    },
    "sortdesc": {
        "type": "bool",
        "example": false,
        "desc": "false = ascending, true = descending sort"
    },
    "cols": {
        "type": "array",
        "example": "[\"Artist\", \"Album\", \"Title\"]",
        "desc": "array of columns to return"
    },
    "expression": {
        "type": "text",
        "example": "((any contains 'tabula'))",
        "desc": "MPD search expression"
    },
    "searchstr": {
        "type": "text",
        "example": "tabula",
        "desc": "string to search"
    },
    "uri": {
        "type": "text",
        "example": "Testfiles/Sp.mp3",
        "desc": "relativ song uri"
    },
    "filter": {
        "type": "text",
        "example": "Title",
        "desc": "tag to search or \"any\" for all tags"
    },
    "from": {
        "type": "uint",
        "example": 2,
        "desc": "From position",
    },
    "to": { 
        "type": "uint",
        "example": 1,
        "desc": "To position"
    },
    "plist": {
        "type": "text",
        "example": "test_plist",
        "desc": "MPD playlist name"
    },
    "sortShuffle": {
        "type": "text",
        "example": "shuffle",
        "desc": "blank = no sorting, shuffle = shuffle, tagname = sort by tag"
    },
    "songId": {
        "type": "uint",
        "example": 1,
        "desc": "MPD queue song id"
    },
    "timerid": {
        "type": "uint",
        "example": 101,
        "desc": "timer id, must be gt 100"
    },
    "script": {
        "type": "text",
        "example": "testscript",
        "desc": "Name of the script"
    },
    "scriptArguments": {
        "type": "object",
        "example": "{\"argname1\": \"argvalue1\"}",
        "desc": "Script arguments"
    },
    "partName": {
        "type": "text",
        "example": "partition1",
        "desc": "Name of the new partition"
    },
    "triggerId": {
        "type": "uint",
        "example": 1,
        "desc": "id of the trigger"
    },
    "pos": {
        "type": "uint",
        "example": 2,
        "desc": "Position of song"
    }
};

const APImethods = {
    "MYMPD_API_DATABASE_SEARCH_ADV": {
        "desc": "Searches for songs in the database (new interface).",
        "params": {
            "offset": APIparams.offset,
            "limit": APIparams.limit,
            "expression": APIparams.expression,
            "sort": APIparams.sort,
            "sortdesc": APIparams.sortdesc,
            "plist": {
                "type": "text",
                "example": "queue",
                "desc": "playlist to add results to, use \"queue\" to add search to queue"
            },
            "cols": APIparams.cols,
            "replace": {
                "type": "bool",
                "example": false,
                "desc": "true = replaces the queue, false = append to qeue"
            }
        }
    },
    "MYMPD_API_DATABASE_SEARCH": {
        "desc": "Searches for songs in the database (deprecated interface).",
        "params": {
            "offset": APIparams.offset,
            "limit": APIparams.limit,
            "filter": APIparams.filter,
            "searchstr": APIparams.searchstr,
            "plist": {
                "type": "text",
                "example": "queue",
                "desc": "MPD playlist to add results to, use \"queue\" to add search to queue"
            },
            "cols": APIparams.cols,
            "replace": {
                "type": "bool",
                "example": false,
                "desc": "true = replaces the queue, false = append to qeue"
            }
        }
    },
    "MYMPD_API_DATABASE_UPDATE": {
        "desc": "Updates the database.",
        "params": {
            "uri": {
                "type": "text",
                "example": "Alben",
                "desc": "Root directory for update"
            }
        }
    },
    "MYMPD_API_DATABASE_RESCAN": {
        "desc": "Rescans the database.",
        "params": {
            "uri": {
                "type": "text",
                "example": "Alben",
                "desc": "Root directory for rescan"
            }
        }
    },
    "MYMPD_API_DATABASE_FILESYSTEM_LIST": {
        "desc": "Lists directories, songs and playlists.",
        "params": {
            "offset": APIparams.offset,
            "limit": APIparams.limit,
            "searchstr": APIparams.searchstr,
            "path": {
                "type": "text",
                "example": "Alben",
                "desc": "Directory to list"
            },
            "cols": APIparams.cols
        }
    },
    "MYMPD_API_DATABASE_ALBUMS_GET": {
        "desc": "Lists unique albums.",
        "params": {
            "offset": APIparams.offset,
            "limit": APIparams.limit,
            "expression": APIparams.expression,
            "sort": APIparams.sort,
            "sortdesc": APIparams.sortdesc
        }
    },
    "MYMPD_API_DATABASE_TAG_LIST": {
        "desc": "Lists unique tag values.",
        "params":{
            "offset": APIparams.offset,
            "limit": APIparams.limit,
            "searchstr": APIparams.searchstr,
            "tag": {
                "type": "text",
                "example": "Genre",
                "desc": "Tag to display"
            }
        }
    },
    "MYMPD_API_DATABASE_TAG_ALBUM_TITLE_LIST": {
        "desc": "Displays songs of an album.",
        "params": {
            "album": {
                "type": "text",
                "example": "Tabula Rasa",
                "desc": "Album to display"
            },
            "albumartist": {
                "type": "text",
                "example": "Einstürzende Neubauten",
                "desc": "Albumartist"
            },
            "cols": APIparams.cols
        }
    },
    "MYMPD_API_DATABASE_STATS": {
        "desc": "Shows MPD database statistics.",
        "params": {}
    },
    "MYMPD_API_DATABASE_SONGDETAILS": {
        "desc": "Shows all details of a song.",
        "params": {
            "uri": APIparams.uri
        }
    },
    "MYMPD_API_DATABASE_COMMENTS": {
        "desc": "Shows comments of uri.",
        "params": {
            "uri": APIparams.uri
        }
    },
    "MYMPD_API_DATABASE_FINGERPRINT": {
        "desc": "Calculates the chromaprint fingerprint",
        "params": {
            "uri": APIparams.uri
        }
    },
    "MYMPD_API_QUEUE_CLEAR": {
        "desc": "Clears the queue.",
        "params": {}
    },
    "MYMPD_API_QUEUE_CROP": {
        "desc": "Crops the queue (removes all songs except playing one)",
        "params": {}
    },
    "MYMPD_API_QUEUE_CROP_OR_CLEAR": {
        "desc": "Clears (if only one song is in queue) or crops the queue",
        "params": {}
    },
    "MYMPD_API_QUEUE_ADD_RANDOM": {
        "desc": "Adds random songs or albums to the queue.",
        "params": {
            "plist": {
                "type": "text",
                "example": "Database",
                "desc": "Name of mpd playlist or \"Database\""
            },
            "quantity": {
                "type": "uint",
                "example": 10,
                "desc": "Number of songs or albums to add"
            },
            "mode": {
                "type": "uint",
                "example": 1,
                "desc": "1 = add songs, 2 = add albums"
            }
        }
    },
    "MYMPD_API_QUEUE_SAVE": {
        "desc": "Saves the queue as playlist.",
        "params": {
            "plist": {
                "type": "text",
                "example": "test_pl",
                "desc": "Playlist name"
            }
        }
    },
    "MYMPD_API_QUEUE_LIST": {
        "desc": "List the songs from the queue.",
        "params": {
            "offset": APIparams.offset,
            "limit": APIparams.limit,
            "cols": APIparams.cols
        }
    },
    "MYMPD_API_QUEUE_SEARCH": {
        "desc": "Searches the queue.",
        "params": {
            "offset": APIparams.offset,
            "limit": APIparams.limit,
            "filter": APIparams.filter,
            "searchstr": APIparams.searchstr,
            "cols": APIparams.cols
        }
    },
    "MYMPD_API_QUEUE_RM_SONG": {
        "desc": "Removes the song from the queue.",
        "params": {
            "songId": APIparams.songId
        }
    },
    "MYMPD_API_QUEUE_RM_RANGE": {
        "desc": "Removes a range from the queue.",
        "params": {
            "start": {
                "type": "uint",
                "example": 0,
                "desc": "Start queue position",
            },
            "end": {
                "type": "uint",
                "example": 1,
                "desc": "End queue position"
            }
        }
    },
    "MYMPD_API_QUEUE_MOVE_SONG": {
        "desc": "Moves a song in the queue.",
        "params": {
            "from": APIparams.from,
            "to": APIparams.to
        }
    },
    "MYMPD_API_QUEUE_ADD_URI_AFTER": {
        "desc": "Adds song(s) to distinct position in queue.",
        "params": {
            "uri": APIparams.uri,
            "to": APIparams.to
        }
    },
    "MYMPD_API_QUEUE_ADD_URI": {
        "desc": "Appends song(s) to the queue.",
        "params": {
            "uri": APIparams.uri
        }
    },
    "MYMPD_API_QUEUE_ADD_PLAY_URI": {
        "desc": "Appends song(s) to queue queue and plays it.",
        "params": {
            "uri": APIparams.uri
        }
    },
    "MYMPD_API_QUEUE_REPLACE_URI": {
        "desc": "Replaces the queue with song(s).",
        "params": {
            "uri": APIparams.uri
        }
    },
    "MYMPD_API_QUEUE_ADD_PLAYLIST": {
        "desc": "Appends the playlist to the queue.",
        "params": {
            "plist": APIparams.plist
        }
    },
    "MYMPD_API_QUEUE_REPLACE_PLAYLIST": {
        "desc": "Replaces the queue with the playlist.",
        "params": {
            "plist": APIparams.plist
        }
    },
    "MYMPD_API_QUEUE_SHUFFLE": {
        "desc": "Shuffles the queue.",
        "params": {}
    },
    "MYMPD_API_QUEUE_PRIO_SET_HIGHEST": {
        "desc": "Set highest prio for specified song",
        "params": {
            "songId": APIparams.songId
        }
    },
    "MYMPD_API_QUEUE_LAST_PLAYED": {
        "desc": "Lists the last played songs.",
        "params": {
            "offset": APIparams.offset,
            "limit": APIparams.limit,
            "cols": APIparams.cols
        }
    },
    "MYMPD_API_PLAYLIST_RM": {
        "desc": "Removes the MPD playlist.",
        "params": {
            "plist": APIparams.plist,
            "smartplsOnly": {
                "type": "bool",
                "example": false,
                "desc": "false = delete mpd playlist and smartpls definition, true = deletes only smartpls definition"
            }
        }
    },
    "MYMPD_API_PLAYLIST_CLEAR": {
        "desc": "Clears the MPD playlist.",
        "params": {
            "plist": APIparams.plist
        }
    },
    "MYMPD_API_PLAYLIST_RENAME": {
        "desc": "Renames the MPD playlist.",
        "params": {
            "plist": {
                "type": "text",
                "example": "test_plist",
                "desc": "MPD playlist to rename"
            },
            "newName": {
                "type": "text",
                "example": "test_plist_renamed",
                "desc": "New MPD playlist name"
            }
        }
    },
    "MYMPD_API_PLAYLIST_MOVE_SONG": {
        "desc": "Moves a song in the playlist.",
        "params": {
            "plist": APIparams.plist,
            "from": APIparams.from,
            "to": APIparams.to
        }
    },
    "MYMPD_API_PLAYLIST_ADD_URI": {
        "desc": "Appens a song to the playlist",
        "params": {
            "plist": APIparams.plist,
            "uri": APIparams.uri
        }
    },
    "MYMPD_API_PLAYLIST_RM_SONG": {
        "desc": "Removes a song from the playlist.",
        "params": {
            "plist": APIparams.plist,
            "pos": APIparams.pos
        }
    },
    "MYMPD_API_PLAYLIST_RM_ALL": {
        "desc": "Batch removes playlists.",
        "protected": true,
        "params": {
            "type": {
                "type": "text",
                "example": "deleteEmptyPlaylists",
                "desc": "valid values are: \"deleteEmptyPlaylists\", \"deleteSmartPlaylists\", \"deleteAllPlaylists\""
            }
        }
    },
    "MYMPD_API_PLAYLIST_LIST": {
        "desc": "Lists all MPD playlists.",
        "params": {
            "offset": APIparams.offset,
            "limit": APIparams.limit,
            "searchstr": APIparams.searchstr
        }
    },
    "MYMPD_API_PLAYLIST_CONTENT_LIST": {
        "desc": "Lists songs in the playlist.",
        "params": {
            "plist": APIparams.plist,
            "offset": APIparams.offset,
            "limit": APIparams.limit,
            "searchstr": APIparams.searchstr, 
            "cols": APIparams.cols
        }
    },
    "MYMPD_API_PLAYLIST_SHUFFLE": {
        "desc": "Shuffles the playlist.",
        "params": {
            "plist": APIparams.plist
        }
    },
    "MYMPD_API_PLAYLIST_SORT": {
        "desc": "Sorts the playlist.",
        "params": {
            "plist": APIparams.plist,
            "tag": {
                "type": "text",
                "example": "Artist",
                "desc": "Tag to sort"
            }
        }
    },
    "MYMPD_API_SMARTPLS_UPDATE_ALL": {
        "desc": "Updates all smart playlists.",
        "async": true,
        "params": {
            "force": {
                "type": "bool",
                "example": false,
                "desc": "true = forces an update"
            }
        }
    },
    "MYMPD_API_SMARTPLS_UPDATE": { 
        "desc": "Updates the smart playlist.",
        "async": true,
        "params": {
            "plist": APIparams.plist
        }
    },
    "MYMPD_API_SMARTPLS_NEWEST_SAVE": {
        "desc": "Saves a smart playlist of type newest songs.",
        "params": {
            "plist": APIparams.plist,
            "timerange": {
                "type": "uint",
                "example": 604800,
                "desc":"timerange in seconds"
            },
            "sort": APIparams.sortShuffle
        }
    },
    "MYMPD_API_SMARTPLS_STICKER_SAVE": {
        "desc": "Saves a sticker search as a smart playlist.",
        "params": {
            "plist": APIparams.plist,
            "sticker": {
                "type": "text",
                "example": "like",
                "desc":"Sticker name"
            },
            "maxentries": {
                "type": "uint",
                "example": 200,
                "desc": "maximum entries"
            },
            "minvalue": {
                "type": "uint",
                "example": 2,
                "desc": "minimum integer value"
            },
            "sort": APIparams.sortShuffle
        }
    },
    "MYMPD_API_SMARTPLS_SEARCH_SAVE": {
        "desc": "Saves a search expression as a smart playlist.",
        "params": {
            "plist": APIparams.plist,
            "expression": APIparams.expression,
            "sort": APIparams.sortShuffle
        }
    },
    "MYMPD_API_SMARTPLS_GET": {
        "desc": "Gets the smart playlist options.",
        "params": {
            "plist": APIparams.plist
        }
    },
    "MYMPD_API_PLAYER_PLAY_SONG": {
        "desc": "Starts playing the specified song.",
        "params": {
            "songId": APIparams.songId
        }
    },
    "MYMPD_API_PLAYER_VOLUME_SET": {
        "desc": "Sets the volume.", 
        "params": {
            "volume": {
                "type": "uint",
                "example": 50,
                "desc": "volume percent"
            }
        }
    },
    "MYMPD_API_PLAYER_VOLUME_GET": {
        "desc": "Gets the volume.",
        "params": {}
    },
    "MYMPD_API_PLAYER_PAUSE": {
        "desc": "Pauses the current playing song.",
        "params": {}
    },
    "MYMPD_API_PLAYER_RESUME": {
        "desc": "Resumes the current paused song.",
        "params": {}
    },
    "MYMPD_API_PLAYER_PLAY": {
        "desc": "Starts playing.",
        "params": {}
    },
    "MYMPD_API_PLAYER_STOP": {
        "desc": "Stops playing.",
        "params": {}
    },
    "MYMPD_API_PLAYER_SEEK_CURRENT": {
        "desc": "Seeks the current playing song.",
        "params": {
            "seek": {
                "type": "int",
                "example": 5,
                "desc": "seconds to seek"
            },
            "relative": {
                "type": "bool",
                "example": true,
                "desc": "true = relative seek, false = goto seek seconds in song"
            }
        }
    },
    "MYMPD_API_PLAYER_NEXT": {
        "desc": "Goto next song in queue.",
        "params": {}
    },
    "MYMPD_API_PLAYER_PREV": {
        "desc": "Goto previous song in queue.",
        "params": {}
    },
    "MYMPD_API_PLAYER_OUTPUT_LIST": {
        "desc": "Lists the MPD outputs.",
        "params": {
            "partition": {
                "type": "text",
                "example": "",
                "desc": "MPD partition, blank for default partition"
            }
        }
    },
    "MYMPD_API_PLAYER_OUTPUT_TOGGLE": {
        "desc": "Toggles the output state.",
        "params": {
            "outputId": {
                "type": "uint",
                "example": 0,
                "desc": "MPD output id"
            },
            "state": {
                "type": "uint",
                "example": 0,
                "desc": "0 = disable, 1 = enable"
            }
        }
    },
    "MYMPD_API_PLAYER_CURRENT_SONG": {
        "desc": "Shows details of current playing song.",
        "params": {}
    },
    "MYMPD_API_PLAYER_STATE": {
        "desc": "Shows the mpd player state.",
        "params": {}
    },
    "MYMPD_API_PLAYER_CLEARERROR": {
        "desc": "Clears the current error message.",
        "params": {}
    },
    "MYMPD_API_LIKE": {
        "desc": "Sets the like status of a song.",
        "params": {
            "uri": APIparams.uri,
            "like": {
                "type": "uint",
                "example": 1,
                "desc": "0 = dislike, 1 = neutral, 2 = like"
            }
        }
    },
    "MYMPD_API_MOUNT_LIST": {
        "desc": "Lists the MPD monts.",
        "params": {}
    },
    "MYMPD_API_MOUNT_NEIGHBOR_LIST": {
        "desc": "Lists the neighbors.",
        "params": {}
    },
    "MYMPD_API_MOUNT_MOUNT": {
        "desc": "Mounts a network path.",
        "protected": true,
        "params": {
            "mountUrl": {
                "type": "text",
                "example": "nfs://192.168.1.1/music",
                "desc": "URL to mount."
            }, 
            "mountPoint": {
                "type": "text",
                "example": "nas",
                "desc": "Path to mount the URL"
            }
        }
    },
    "MYMPD_API_MOUNT_UNMOUNT": {
        "desc": "Unmounts a mounted network path.",
        "protected": true,
        "params": {
            "mountPoint": {
                "type": "text",
                "example": "nas",
                "desc": "Path to unmount"
            }
        }
    },
    "MYMPD_API_URLHANDLERS": {
        "desc": "Lists all known url handlers of MPD.",
        "params": {}
    },
    "MYMPD_API_CONNECTION_SAVE": {
        "desc": "Saves the MPD connection parameters.",
        "protected": true,
        "params": {
            "mpdHost": {
                "type": "text",
                "example": "/run/mpd/socket",
                "desc": "MPD host or socket"
            },
            "mpdPort": {
                "type": "uint",
                "example": "6000",
                "desc": "MPD port to use"
            },
            "musicDirectory": {
                "type": "text",
                "example": "auto",
                "desc": "\"auto\" = autodetect (needs socket connection), " +
                        "\"none\" = no music directory, " +
                        "or absolute path of music directory"
            },
            "playlistDirectory": {
                "type": "text",
                "example": "/var/lib/mpd/playlists",
                "desc": "absolut path of playlist directory"
            },
            "mpdStreamPort": {
                "type": "uint",
                "example": 8000,
                "desc": "port of mpd http stream for local playback"
            },
            "mpdBinarylimit": {
                "type": "uint",
                "example": 8192,
                "desc": "chunk size in bytes for binary data"
            },
            "mpdTimeout": {
                "type": "uint",
                "example": 10000,
                "desc": "MPD timeout in ms"
            }
        }
    },
    "MYMPD_API_SETTINGS_GET": {
        "desc": "Gets all myMPD and MPD settings.",
        "params": {}
    },
    "MYMPD_API_SETTINGS_SET": {
        "desc": "Sets myMPD settings.",
        "protected": true,
        "params": {
            "coverimageNames": {
                "type": "text",
                "example": "folder,cover",
                "desc": "Comma separated list of coverimages, basenames or full names"
            },
            "lastPlayedCount": {
                "type": "uint",
                "example": 200,
                "desc": "Length of the last played list"
            },
            "smartpls": {
                "type": "bool",
                "example": true,
                "desc": "Enabled the smart playlists feature"
            },
            "smartplsPrefix": {
                "type": "text",
                "example": "myMPDsmart",
                "desc": "Prefix for generated smart playlists"
            },
            "smartplsInterval": {
                "type": "uint",
                "example": 14400,
                "desc": "Interval for smart playlists generation in seconds"
            },
            "smartplsSort": {
                "type": "text",
                "example": "",
                "desc": "Sort settings for generated smart playlists, blank = no sort, \"shuffle\" or tag name" 
            },
            "smartplsGenerateTagList": {
                "type": "text",
                "example": "Genre",
                "desc": "Generates smart playlists per value of selected taglist"
            },
            "tagList": {
                "type": "text",
                "example": "Artist,Album,AlbumArtist,Title,Track,Genre,Disc",
                "desc": "Comma separated list of MPD tags to use"
            },
            "tagListSearch": {
                "type": "text",
                "example": "Artist,Album,AlbumArtist,Title,Genre",
                "desc": "Comma separated list of MPD tags for search"
            },
            "tagListBrowse": {
                "type": "text",
                "example": "Artist,Album,AlbumArtist,Genre",
                "desc": "Comma separated list of MPD tags to browse"
            },
            "bookletName": {
                "type": "text",
                "example": "booklet.pdf",
                "desc": "Name of booklet files"
            },
            "volumeMin": {
                "type": "uint",
                "example": 10,
                "desc": "Minimum volume"
            },
            "volumeMax": {
                "type": "uint",
                "example": 90,
                "desc": "Maximum volume"
            },
            "volumeStep": {
                "type": "uint",
                "example": 5,
                "desc": "Step for volume changes"
            },
            "lyricsUsltExt": {
                "type": "text",
                "example": "txt",
                "desc": "File extension for unsynced lyrics"
            },
            "lyricsSyltExt": {
                "type": "text",
                "example": "lrc",
                "desc": "File extension for synced lyrics"
            },
            "lyricsVorbisUslt": {
                "type": "text",
                "example": "LYRICS",
                "desc": "Vorbis tag for unsynced lyrics"
            },
            "lyricsVorbisSylt": {
                "type": "text",
                "example": "SYNCEDLYRICS",
                "desc": "Vorbis tag for synced lyrics"
            },
            "covercacheKeepDays": {
                "type": "uint",
                "example": 7,
                "desc": "Days before deleting cover cache files."
            },
            "webuiSettings": {
                "params": {
                    "clickSong": {
                        "type": "text", 
                        "example": "append",
                        "desc": "Action on click on song: append, replace, view"
                    },
                    "clickQueueSong": {
                        "type": "text",
                        "example": "play",
                        "desc": "Action on click on song in queue: play, view"
                    },
                    "clickPlaylist": {
                        "type": "text",
                        "example": "view",
                        "desc": "Action on click on playlist: append, replace, view"
                    },
                    "clickFolder": {
                        "type": "text",
                        "example": "view",
                        "desc": "Action on click on folder: append, replace, view"
                    },
                    "clickAlbumPlay": {
                        "type": "text",
                        "example": "replace",
                        "desc": "Action on click on album: append, replace"
                    },
                    "notificationPlayer": {
                        "type": "bool",
                        "example": false,
                        "desc": "Enable notifications for player events."
                    },
                    "notificationQueue": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enable notifications for queue events."
                    },
                    "notificationGeneral": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enable notifications for general events."
                    },
                    "notificationDatabase": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enable notifications for database events."
                    },
                    "notificationPlaylist": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enable notifications for playlist events."
                    },
                    "notificationScript": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enable notifications for script events."
                    },
                    "notifyPage": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enable on page notifications"
                    },
                    "notifyWeb": {
                        "type": "bool",
                        "example": false,
                        "desc": "Enable web notifications"
                    },
                    "mediaSession": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enable media session support"
                    },
                    "uiFooterQueueSettings": {
                        "type": "bool",
                        "example": true,
                        "desc": "Shows playback settings button in footer."
                    },
                    "uiFooterPlaybackControls": {
                        "type": "bool",
                        "example": "both",
                        "desc": "\"pause\", \"stop\" or \"both\" for pause and stop"
                    },
                    "uiMaxElementsPerPage": {
                        "type": "uint",
                        "example": 50,
                        "desc": "max. elements for lists: 25, 50, 100, 200 or 0 for unlimited"
                    },
                    "enableHome": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enables the home screen"
                    },
                    "enableScripting": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enables scripting"
                    },
                    "enableTrigger": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enables trigger"
                    },
                    "enableTimer": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enables timer"
                    },
                    "enableMounts": {
                        "type": "bool",
                        "example": true,
                        "desc": "Enables mounts"
                    },
                    "enableLocalPlayback": {
                        "type": "bool",
                        "example": false,
                        "desc": "Enables local playback of mpd http stream"
                    },
                    "enablePartitions": {
                        "type": "bool",
                        "example": false,
                        "desc": "Enables partitions"
                    },
                    "enableLyrics": {
                        "type": "text",
                        "example": true,
                        "desc": "Enable Lyrics"
                    },
                    "uiTheme": {
                        "type": "text",
                        "example": "theme-dark",
                        "desc": "\"theme-dark\", \"theme-light\" or \"theme-default\""
                    },
                    "uiHighlightColor": {
                        "type": "text",
                        "example": "#28a745",
                        "desc": "Highlight color"
                    },
                    "uiCoverimageSize": {
                        "type": "int",
                        "example": 250,
                        "desc": "Size for coverimages"
                    },
                    "uiCoverimageSizeSmall": {
                        "type": "int",
                        "example": 175,
                        "desc": "Size for small cover images"
                    },
                    "uiBgColor": {
                        "type": "text",
                        "example": "#000000",
                        "desc": "Background color"
                    },
                    "uiBgImage": {
                        "type": "text",
                        "example": "",
                        "desc": "Uri for bacckground image"
                    },
                    "uiBgCover": {
                        "type": "bool",
                        "example": true,
                        "desc": "Display the coverimage as background"
                    },
                    "uiBgCssFilter": {
                        "type": "text",
                        "example": "grayscale(100%) opacity(10%)",
                        "desc": "CSS filter for background coverimage"
                    },
                    "uiLocale": {
                        "type": "text",
                        "example": "de-DE",
                        "desc": "Language code or \"auto\" for browser default"
                    }
                }
            }
        }
    },
    "MYMPD_API_PLAYER_OPTIONS_SET": {
        "desc": "Sets MPD and jukebox options.",
        "params":{
            "consume": {
                "type": "uint",
                "example": 1,
                "desc": "MPD consume mode: 1=enabled, 0=disabled"
            },
            "random": {
                "type": "uint",
                "example": 0,
                "desc": "MPD randome mode: 1=enabled, 0=disabled"
            },
            "single": {
                "type": "uint",
                "example": 1,
                "desc": "MPD single mode: 2=single oneshot, 1=enabled, 0=disabled"
            },
            "repeat": {
                "type": "uint",
                "example": 1,
                "desc": "MPD repeat mode: 1=enabled, 0=disabled"
            },
            "replaygain": {
                "type": "text",
                "example": "off",
                "desc": "MPD replaygain mode: \"off\", \"auto\", \"track\", \"album\""
            },
            "crossfade": {
                "type": "uint",
                "example": 0,
                "desc": "MPD crossfade in seconds"
            },
            "jukeboxMode": {
                "type": "uint",
                "example": 1,
                "desc": "Jukebox mode: 0=disabled, 1=song, 2=album"
            },
            "jukeboxPlaylist": {
                "type": "text",
                "example": "Database",
                "desc": "Playlist for jukebox or \"Databas\" for whole database."
            },
            "jukeboxQueueLength": {
                "type": "uint",
                "example": 1,
                "desc": "Minimum queue length to maintain."
            },
            "jukeboxLastPlayed": {
                "type": "uint",
                "example": 24,
                "desc": "Add only songs that are not played x hours before."
            },
            "jukeboxUniqueTag": {
                "type": "text",
                "example": "Album",
                "desc": "Tag to maintain unique values in internal jukebox queue."
            },
            "autoPlay": {
                "type": "bool",
                "example": false,
                "desc": "Start playing if a song is adder to queue."
            }
        }
    },
    "MYMPD_API_COLS_SAVE": {
        "desc": "Saves columnes for a table.",
        "params": {
            "table": {
                "type": "text",
                "example": "colsQueueJukebox",
                "desc": "Valid values: colsQueueCurrent, colsQueueLastPlayed, colsSearch, colsBrowseDatabaseDetail, colsBrowsePlaylistsDetail, colsBrowseFilesystem, colsPlayback, colsQueueJukebox"
            },
            "cols": APIparams.cols
        }
    },
    "MYMPD_API_TIMER_SAVE": {
        "desc": "Saves a timer.",
        "protected": true,
        "params": {
            "timerid": {
                "type": "uint",
                "example": 0,
                "desc": "Timer id, 0 to create a new timer."
            },
            "interval": {
                "type": "int",
                "example": 86400,
                "desc": "Timer interval in seconds, 0 = one shote and deactivate, -1 = one shot and remove"
            },
            "name": {
                "type": "text",
                "example": "example timer",
                "desc": "Name of the timer"
            },
            "enabled": {
                "type": "bool",
                "example": true,
                "desc": "Enables or disables the timer"
            },
            "startHour": {
                "type": "uint",
                "example": 7,
                "desc": "Start hour of the timer, valid values are 0 -23"
            },
            "startMinute": {
                "type": "uint",
                "example": 0,
                "desc": "Start minute of the timer, valid values are 0-59"
            },
            "action": {
                "type": "text",
                "example": "player",
                "desc": "Timer action, valid values: player, script"
            },
            "subaction": {
                "type": "text",
                "example": "startplay",
                "desc": "Action = player: startplay, stopplay; Action = script: Script name"
            },
            "volume": {
                "type": "uint",
                "example": 50,
                "desc": "Volume in percent"
            },
            "playlist": {
                "type": "text",
                "example": "Database",
                "desc": "Playlist to use, valid values: \"Database\" or MPD playlist name"
            },
            "jukeboxMode": {
                "type": "uint",
                "example": 1,
                "desc": "Jukebox mode: 0 = off, 1 = song, 2 = album"
            },
            "weekdays": {
                "type": "array",
                "example": "[false,false,false,false,false,true,true]",
                "desc": "Boolean array for weekdays, starting at monday"
            },
            "arguments": {
                "type": "object",
                "example": "{\"arg1\": \"value1\"}",
                "desc": "Script arguments"
            }
        }
    },
    "MYMPD_API_TIMER_LIST": {
        "desc": "Lists all timers",
        "params": {}
    },
    "MYMPD_API_TIMER_GET": {
        "desc": "Gets options from a timer",
        "params":{
            "timerid": APIparams.timerid
        }
    },
    "MYMPD_API_TIMER_RM": {
        "desc": "Removes a timer",
        "protected": true,
        "params": {
            "timerid": APIparams.timerid
        }
    },
    "MYMPD_API_TIMER_TOGGLE": {
        "desc": "Toggles a timers enabled state",
        "protected": true,
        "params": {
            "timerid": APIparams.timerid
        }
    },
    "MYMPD_API_MESSAGE_SEND":  {
        "desc": "Sends a message to a MPD channel",
        "params": {
            "channel": {
                "type": "text",
                "example": "mpdscribble",
                "desc": "MPD channel name"
            },
            "message": {
                "type": "text",
                "example": "love",
                "desc": "Message to send"
            }
        }
    },
    "MYMPD_API_SCRIPT_SAVE": {
        "desc": "Saves a script",
        "protected": true,
        "params": {
            "script": APIparams.script,
            "oldscript": {
                "type": "text",
                "example": "testscript",
                "desc": "Name of the old script to rename"
            },
            "order": {
                "type": "uint",
                "example": 1,
                "desc": "Order for the scripts in main menu, 0 = disable listing in main menu"
            },
            "content": {
                "type": "text",
                "example": "return \"test\"",
                "desc": "The lua script itself"
            },
            "arguments": {
                "type": "array",
                "example": "[\"argname1\",\"argname2\"]",
                "desc": "Array of parameters for this script"
            }
        }
    },
    "MYMPD_API_SCRIPT_LIST": {
        "desc": "Lists all scripts",
        "params": {
            "all": {
                "type": "bool",
                "example": true,
                "desc": "true = lists all scripts, false = lists all scripts with order > 0"
            }
        }
    },
    "MYMPD_API_SCRIPT_GET": {
        "desc": "Gets options from a timer",
        "params": {
            "script": APIparams.script
        }
    },
    "MYMPD_API_SCRIPT_RM": {
        "desc": "Removes a script",
        "protected": true,
        "params": {
            "script": APIparams.script
        }
    },
    "MYMPD_API_SCRIPT_EXECUTE": {
        "desc": "Executes a script",
        "params": {
            "script": APIparams.script,
            "arguments": APIparams.scriptArguments
        }
    },
    "MYMPD_API_SCRIPT_POST_EXECUTE": {
        "desc": "Posts a lua script to myMPD for execution",
        "params": {
            "script": {
                "type": "text",
                "example": "return \"test\"..argname1",
                "desc": "The lua script itself"
            },
            "arguments": APIparams.scriptArguments
        }
    },
    "MYMPD_API_PARTITION_LIST": {
        "desc": "Lists all MPD partitions",
        "params":{}
    },
    "MYMPD_API_PARTITION_NEW": {
        "desc": "Creates a new MPD partition",
        "protected": true,
        "params": {
            "name": APIparams.partName
        }
    },
    "MYMPD_API_PARTITION_SWITCH": {
        "desc": "Switch mpd client to this partition",
        "params": {
            "name": APIparams.partName
        }
    },
    "MYMPD_API_PARTITION_RM": {
        "desc": "Removes a mpd partition.",
        "protected": true,
        "params": {
            "name": APIparams.partName
        }
    },
    "MYMPD_API_PARTITION_OUTPUT_MOVE": {
        "desc": "Moves this output to current MPD partition",
        "protected": true,
        "params": {
            "name": {
                "tye": "text",
                "example": "output1",
                "desc": "output name"
            }
        }
    },
    "MYMPD_API_TRIGGER_LIST": {
        "desc": "Lists all triggers",
        "params": {}
    },
    "MYMPD_API_TRIGGER_GET": {
        "desc": "Get the options from a trigger",
        "params": {
            "id": APIparams.triggerId
        }
    },
    "MYMPD_API_TRIGGER_SAVE": {
        "desc": "Saves a trigger",
        "protected": true,
        "params": {
            "id": APIparams.triggerId,
            "name": {
                "type": "text",
                "example": "test trigger",
                "desc": "Name of the trigger"
            },
            "event": {
                "type": "int",
                "example": 1,
                "desc": "Event id that executes this triggers script"
            },
            "script": {
                "type": "text",
                "example": "test script",
                "desc": "Script to execute"
            },
            "arguments": APIparams.scriptArguments
        }
    },
    "MYMPD_API_TRIGGER_RM": {
        "desc": "Deletes a trigger",
        "protected": true,
        "params":{
            "id": APIparams.triggerId
        }
    },
    "MYMPD_API_PLAYER_OUTPUT_ATTRIBUTS_SET": {
        "desc": "Sets an MPD output attribute",
        "protected": true,
        "params": {
            "outputId": {
                "type": "uint",
                "example": 0,
                "desc": "MPD output id"
            },
            "attributes": {
                "type" : "object",
                "example": "{\"allowed_formats\": \"\"}",
                "desc": "Key/value pairs to set attributes"
            }
        }
    },
    "MYMPD_API_HOME_LIST": {
        "desc": "Lists all home icons",
        "params": {}
    },
    "MYMPD_API_HOME_ICON_RM": {
        "desc": "Deletes a home icon",
        "params": {
            "pos": {
                "type": "uint",
                "example": 0,
                "desc": "Icon number to delete"
            }
        }
    },
    "MYMPD_API_HOME_ICON_MOVE": {
        "desc": "Move home icon position",
        "params": {
            "from": APIparams.from,
            "to": APIparams.to
        }
    },
    "MYMPD_API_HOME_ICON_GET": {
        "desc": "Gets details for a home icon",
        "params": {
            "pos": {
                "type": "uint",
                "example": 0,
                "desc": "Icon number to get"
            }
        }
    },
    "MYMPD_API_HOME_ICON_SAVE": {
        "desc": "Saves a home icon",
        "params": {
            "replace": {
                "type": "bool",
                "example": false,
                "desc": "Replace icon at pos oldpos"
            },
            "oldpos": {
                "type": "uint",
                "example": 0,
                "desc": "Position of home icon to replace"
            },
            "name": {
                "type": "text",
                "example": "test home icon",
                "desc": "Name of the home icon"
            },
            "ligature": {
                "type": "text",
                "example": "new_releases",
                "desc": "Ligature to use"
            },
            "bgcolor": {
                "type": "text",
                "example": "#ffee00",
                "desc": "Background color"
            },
            "color": {
                "type": "text",
                "example": "#ffee00",
                "desc": "Color for ligature"
            },
            "image": {
                "type": "text",
                "example": "home-icon-1.png",
                "desc": "realtive path for an image (/pics/ is the root)"
            },
            "cmd": {
                "type": "text",
                "example": "replaceQueue",
                "desc": "Valid values: replaceQueue = replace queue with a playlist, appGoto = goto a view, execScriptFromOptions = execute script"
            },
            "options": {
                "type": "array",
                "example": "[\"plist\",\"nas/Webradios/swr1.m3u\",\"swr1.m3u\"]",
                "desc": "Array of cmd options" +
                        "for replaceQueue: [\"plist\",\"nas/Webradios/swr1.m3u\",\"swr1.m3u\"], " +
                        "for appGoto: [\"Browse\",\"Database\",\"List\",\"0\",\"AlbumArtist\",\"-Last-Modified\",\"Album\",\"\"], "+
                        "for execScriptFromOptions: [\"Scriptname\",\"scriptarg1\"]"
            }
        }
    },
    "MYMPD_API_PICTURE_LIST": {
        "desc": "Lists all pictures in the /pics directory.",
        "params": {}
    },
    "MYMPD_API_JUKEBOX_LIST": {
        "desc": "Lists the internal jukebox queue.",
        "params": {
            "offset": APIparams.offset,
            "limit": APIparams.limit,
            "cols": APIparams.cols
        }
    },
    "MYMPD_API_JUKEBOX_RM": {
        "desc": "Removes a song or album from the jukebox queue.",
        "params": {
            "pos": APIparams.pos
        }
    },
    "MYMPD_API_LYRICS_GET": {
        "desc": "Gets all lyrics from uri.",
        "params": {
            "uri": APIparams.uri
        }
    },
    "MYMPD_API_SESSION_LOGIN": {
        "desc": "Get a session ticket with supplied pin.",
        "params": {
            "pin": {
                "type": "text",
                "example": "1234",
                "desc": "The myMPD settings pin, configured with mympd -p."
            }
        }
    },
    "MYMPD_API_SESSION_LOGOUT": {
        "desc": "Removes the session from the session table.",
        "protected": true,
        "params": {}
    },
    "MYMPD_API_SESSION_VALIDATE": {
        "desc": "Validates the session table.",
        "protected": true,
        "params": {}
    },
    "MYMPD_API_COVERCACHE_CLEAR": {
        "desc": "Clears the covercache",
        "params": {}
    },
    "MYMPD_API_COVERCACHE_CROP": {
        "desc": "Clears the covercache",
        "params": {}
    }
};
