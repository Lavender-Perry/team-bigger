"use strict";

/* All undeclared variables are IDs of HTML elements */

// Waits for allTeamsRequest, filters teams, prepares all lists for display
async function filterAndShowTeams(divisions) {
    // Filter all teams to just the ones in the game
    // Update when divisions change
    const game_divisions = divisions.slice(28, 31).concat(divisions[43]);
    const team_ids = game_divisions.reduce((acc, val) => acc.concat(val.teams), []);

    const allTeams_response = await allTeams_request;
    if (!allTeams_response.ok)
        aerror(allTeams_response.status);

    const teams = await allTeams_response.json();
    const game_teams = teams.filter(team => team_ids.indexOf(team.id) !== -1);

    // Display normal results
    displayTeams(teamTotal, game_teams, results);
    results.style.display = "block";
    // Get shadowed ready for display
    displayTeams(ttShadows, game_teams, results_shadowed);
    // Get FK results ready for display
    displayTeams(teamTotal, teams, fkresults);
    displayTeams(ttShadows, teams, fkresults_shadowed);

    // Set the input function for & display the options form
    options.oninput = optionsInputHandler;
    options.style.display = "block";

    // Remove the loading indicator
    progress.remove();
}

// Calculates team total players of teams using totals_fn, & displays them from most
// players to least players in div_container
function displayTeams(totals_fn, teams, div_container) {
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
        const shadow_string = div_container.id.endsWith("_shadowed")
            ? `, ${team.shadows.length} shadowed player${ending(team.shadows.length)}`
            : "";
        const hitters = team.lineup.length;
        const pitchers = team.rotation.length;
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
    const div_toggles = function () {
        switch (event.target) {
            case fkteams_toggle:
                return shadows_toggle.checked
                    ? {on: fkresults_shadowed, off: results_shadowed}
                    : {on: fkresults, off: results};
            case shadows_toggle:
                return fkteams_toggle.checked
                    ? {on: fkresults_shadowed, off: fkresults}
                    : {on: results_shadowed, off: results};
            default:
                throw `Unknown event input target ID ${event.target.id}`;
        }
    }();
    [div_toggles.on.style.display, div_toggles.off.style.display] = event.target.checked
        ? ["block", "none"]
        : ["none", "block"];
}

// Change this to corsmechanics if that ever gets consistent uptime
const getFromAPI = str =>
    fetch(`https://jsonp.afeld.me/?url=https://api.blaseball.com/database/${str}`);

// Alerts for an error fetching API data
const aerror = response => alert(
    "Error fetching Blaseball API data: " + response.status
);

// Functions for calculating total players on a team
const teamTotal = team => team.lineup.length + team.rotation.length;
const ttShadows = team => teamTotal(team) + team.shadows.length;

const allTeams_request = getFromAPI("allTeams");

getFromAPI("allDivisions").then(function(response) {
    if (response.ok)
        response.json().then(filterAndShowTeams);
    else
        aerror(response.status);
});
