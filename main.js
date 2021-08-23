"use strict";

/* All undeclared variables are IDs of HTML elements */

// Get & parse Blaseball API data
const datablase = "https://cors-proxy.blaseball-reference.com/database/";

// Alerts for an error fetching API data
const aerror = response => alert(
    "Error fetching Blaseball API data: " + response.status
);

fetch(datablase + "allTeams").then(function(response) {
    if (response.ok) {
        response.json().then(prepareTeams);
    } else {
        aerror(response);
    }
});

// Uses all teams from first API request to prepare all content for showing
function prepareTeams(teams) {
    // Functions for calculating total players on a team
    const teamTotal = team => team.lineup.length + team.rotation.length;
    const ttShadows = team => teamTotal(team) + team.shadows.length;

    // Get all divisons in the game & filter them to the active ones, filtering
    // the teams to the ones in those divisions
    fetch(datablase + "allDivisions").then(function(response) {
        if (response.ok) {
            response.json().then(function(divisions) {
                // Filter all teams to just the ones in the game
                const divisionNames = [
                    // Update whenever Blaseball divisions change
                    "Vault",
                    "Hall",
                    "Horizon",
                    "Desert"
                ];
                let teamIDs = [];
                divisions.forEach(function(division) {
                    if (divisionNames.indexOf(division.name) !== -1) {
                        teamIDs = teamIDs.concat(division.teams);
                    }
                })
                const gameTeams = teams.filter(
                    team => teamIDs.indexOf(team.id) !== -1
                );
                // Display normal results
                display_teams(teamTotal, gameTeams, results);
                results.style.display = "block";
                // Get shadowed ready for display
                display_teams(ttShadows, gameTeams, results_shadowed);
                // Get FK results ready for display
                display_teams(teamTotal, teams, fkresults);
                display_teams(ttShadows, teams, fkresults_shadowed);

                // Set the input function for & display the options form
                options.oninput = optionsInputHandler;
                options.style.display = "block";

                // Remove the loading indicator
                progress.remove();
            })
        } else {
            aerror(response);
        }
    });
}

// Calculates team total players of teams using totals_fn, & displays them from most
// players to least players in div_container
function display_teams(totals_fn, teams, div_container) {
    const ending = x => (x === 1 ? "" : "s");
    const totals = teams.map(totals_fn);
    // Make the headers & lists for teams
    totals.slice().sort((x, y) => x - y)
        .filter((total, pos, array) => !pos || total !== array[pos - 1])
        .forEach(function(total) {
            div_container.insertAdjacentHTML(
                "afterbegin",
                `<h1>${total} player${ending(total)}</h1>
                <ul id="${div_container.id}_tlist${total}"></ul>`
            );
        });
    // Put the teams in the lists
    teams.forEach(function(team, pos) {
        const hitters = team.lineup.length;
        const pitchers = team.rotation.length;
        let shadow_string = "";
        if (div_container.id.endsWith("_shadowed")) {
            let shadows = team.shadows.length;
            shadow_string = `, ${shadows} shadowed player${ending(shadows)}`;
        }
        document.getElementById(div_container.id + "_tlist" + totals[pos])
            .insertAdjacentHTML(
                "beforeend", 
                `<li>${team.fullName} 
                (${hitters} hitter${ending(hitters)},
                ${pitchers} pitcher${ending(pitchers)}${shadow_string})</li>`
            );
    });
}

// Handles all changes to website options
function optionsInputHandler(event) {
    let divToggles;
    const target = event.target;
    switch (target) {
        case fkteams_toggle: {
            divToggles = shadows_toggle.checked
                ? {on: fkresults_shadowed, off: results_shadowed}
                : {on: fkresults, off: results};
            break;
        }
        case shadows_toggle: {
            divToggles = fkteams_toggle.checked
                ? {on: fkresults_shadowed, off: fkresults}
                : {on: results_shadowed, off: results};
            break;
        }
        default:
            throw `Unknown input event target ID ${target.id}`;
    }
    [divToggles.on.style.display, divToggles.off.style.display] = target.checked
        ? ["block", "none"]
        : ["none", "block"];
}
