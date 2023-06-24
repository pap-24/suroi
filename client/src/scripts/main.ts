import $ from "jquery";
import Phaser from "phaser";

import core from "./core";
import { Game } from "./game";

import { GameScene } from "./scenes/gameScene";
import { MenuScene } from "./scenes/menuScene";
import { MinimapScene } from "./scenes/minimapScene";
import { GRASS_COLOR } from "./utils/constants";

import { setupInputs } from "./utils/inputManager";

declare const API_URL: string;

const playSoloBtn: JQuery = $("#btn-play-solo");

export const enablePlayButton = (): void => {
    playSoloBtn.removeClass("btn-disabled");
    playSoloBtn.prop("disabled", false);
    playSoloBtn.text("Play Solo");
};

$(() => {
    // Join server when play button is clicked
    playSoloBtn.on("click", () => {
        playSoloBtn.addClass("btn-disabled");
        playSoloBtn.prop("disabled", true);
        playSoloBtn.text("Connecting...");
        void $.get(`${API_URL}/getGame?region=${$("#server-select").val() as string}`, (data: { success: boolean, address: string }) => {
            if (data.success) {
                const devPass = new URLSearchParams(window.location.search).get("devPassword");
                let address = `${data.address}/play?name=${encodeURIComponent($("#username-input").val() as string)}`;

                if (devPass && devPass.length > 0) address += `&devPassword=${devPass}`;

                core.game?.connect(address);
                $("#splash-server-message").hide();
            } else {
                $("#splash-server-message-text").html("Game in progress.<br>Please try again in 30 seconds.");
                $("#splash-server-message").show();
                enablePlayButton();
            }
        }).fail(() => {
            $("#splash-server-message-text").html("Error finding game.<br>Please try again.");
            $("#splash-server-message").show();
            enablePlayButton();
        });
    });

    // Initialize the game object
    core.game = new Game();

    // Create the Phaser Game
    // const forceRenderer: string | null = new URLSearchParams(window.location.search).get("forceRenderer");
    core.phaser = new Phaser.Game({
        // type: forceRenderer === "canvas" ? Phaser.CANVAS : forceRenderer === "webgl" ? Phaser.WEBGL : Phaser.AUTO,
        type: Phaser.WEBGL,
        scene: [MenuScene, GameScene, MinimapScene],
        backgroundColor: GRASS_COLOR,
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    });
    setupInputs(core.game);
});
