"use strict"

let api_response = fetch(
    "https://cors-proxy.blaseball-reference.com/database/allTeams",
).then(function(response) {
    if (response.ok) {
        response.json().then(function(teams) {
            let totals = teams.map(team =>
                team.lineup.length + team.rotation.length
            )

            let results = document.getElementById("results")
            let results_shadowed = document.getElementById("results_shadowed")

            display_teams(totals, teams, results)
            // Results are ready so we can show them now
            results.style.display = "block"

            // Now get the shadowed results ready to display
            display_teams(
                totals.map((total, pos) => total + teams[pos].shadows.length),
                teams,
                results_shadowed
            )
        })

        let shadows = document.getElementById("shadows")
        // Set the toggle function for & display the checkbox
        shadows.oninput = checkbox_toggle
        shadows.style.display = "block"

        document.getElementById("progress").remove()
    } else {
        alert("Error fetching Blaseball API data: " + api_response.status)
    }
})

function checkbox_toggle() {
    results_shadowed.style.display = "block"
    results.style.display = "none"
    // Toggle off function
    shadows.oninput = function() {
        results.style.display = "block"
        results_shadowed.style.display = "none"
        shadows.oninput = checkbox_toggle
    }
}

function display_teams(totals, teams, div_container) {
    const ENDING = x => (Math.abs(x) === 1 ? "" : "s")
    // Make the headers & lists for teams
    totals.slice().sort((x, y) => x - y)
        .filter((total, pos, array) => !pos || total !== array[pos - 1])
        .forEach(function(total) {
            div_container.insertAdjacentHTML(
                "afterbegin",
                `<h1>${total} player${ENDING(total)}</h1>
                <ul id="${div_container.id}_tlist${total}"></ul>`
            )
        })
    // Put the teams in the lists
    teams.forEach(function(team, pos) {
        let hitters = team.lineup.length
        let pitchers = team.rotation.length
        let shadow_string = ""
        if (div_container.id == "results_shadowed") {
            let shadows = team.shadows.length
            shadow_string = `, ${shadows} shadowed player${ENDING(shadows)}`
        }
        document.getElementById(div_container.id + "_tlist" + totals[pos])
            .insertAdjacentHTML(
                "beforeend", 
                `<li>${team.fullName} 
                (${hitters} hitter${ENDING(hitters)},
                ${pitchers} pitcher${ENDING(pitchers)}${shadow_string})</li>`
            )
    })
}
