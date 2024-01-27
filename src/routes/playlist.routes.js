import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controllers.js";
import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

// create Playlist
router.route("/createPlaylist").post(createPlaylist)

// getUserPlaylists
router.route("/getUserPlaylists/:userId").get(getUserPlaylists)

// getPlaylistById
router.route("/getPlaylistById/:playlistId").get(getPlaylistById)

// addVideoToPlaylist
router.route("/addVideoToPlaylist/:playlistId/:videoId").patch(addVideoToPlaylist)

// removeVideoFromPlaylist
router.route("/removeVideoFromPlaylist/:playlistId/:videoId").patch(removeVideoFromPlaylist)

// deletePlaylist
router.route("/deletePlaylist/:playlistId").delete(deletePlaylist)

// updatePlaylist
router.route("/updatePlaylist/:playlistId").patch(updatePlaylist)

export default router