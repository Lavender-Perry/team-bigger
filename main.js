"use strict";

/* All undeclared variables are IDs of HTML elements */

// Waits for allTeamsRequest, filters teams, prepares all lists for display
async function filterAndShowTeams(divisions) {
    // Filter all teams to just the ones in the game
    const divisionNames = [
        // Update whenever Blaseball divisions change
        "Vault",
        "Hall",
        "Horizon",
        "Desert"
    ];
    const teamIDs = divisions
        .filter(division => divisionNames.indexOf(division.name) !== -1)
        .reduce((acc, val) => acc.concat(val.teams), []);

    const allTeamsResponse = await allTeamsRequest;
    if (!allTeamsResponse.ok)
        aerror(allTeamsResponse.status);

    const teams = await allTeamsResponse.json();
    const gameTeams = teams.filter(team => teamIDs.indexOf(team.id) !== -1);

    // Display normal results
    displayTeams(teamTotal, gameTeams, results);
    results.style.display = "block";
    // Get shadowed ready for display
    displayTeams(ttShadows, gameTeams, results_shadowed);
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

const getFromAPI = str =>
    fetch(`https://cors-proxy.blaseball-reference.com/database/${str}`);

// Alerts for an error fetching API data
const aerror = response => alert(
    "Error fetching Blaseball API data: " + response.status
);

// Functions for calculating total players on a team
const teamTotal = team => team.lineup.length + team.rotation.length;
const ttShadows = team => teamTotal(team) + team.shadows.length;

const allTeamsRequest = getFromAPI("allTeams");

getFromAPI("allDivisions").then(function(response) {
    if (response.ok)
        response.json().then(filterAndShowTeams);
    else
        aerror(response.status);
});
