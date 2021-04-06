let request = new XMLHttpRequest()
request.open(
    "GET",
    "https://cors-proxy.blaseball-reference.com/database/allTeams",
    true)
request.send();

request.onload = function() {
    let teams = JSON.parse(this.response)
    let totals = teams.map(team => team.lineup.length + team.rotation.length)

    let results = document.getElementById("results")
    let results_shadowed = document.getElementById("results_shadowed")
    let shadows = document.getElementById("shadows")

    display_teams(
        totals,
        teams,
        results,
        team => team.lineup.length,
        team => team.rotation.length,
    )
    // Results are ready so we can show them now
    results.style.display = "block"

    // Now get the shadowed results ready to display
    display_teams(
        totals.map((total, pos) =>
            total + teams[pos].bullpen.length + teams[pos].bench.length),
        teams,
        results_shadowed,
        team => team.lineup.length + team.bullpen.length,
        team => team.rotation.length + team.bench.length,
    )

    // Set the toggle function for & display the checkbox
    shadows.oninput = shadows_on = function() {
        results_shadowed.style.display = "block"
        results.style.display = "none"
        // Toggle off function
        shadows.oninput = function() {
            results.style.display = "block"
            results_shadowed.style.display = "none"
            shadows.oninput = shadows_on
        }
    }
    shadows.style.display = "block"

    document.getElementById("progress").remove()
}

function display_teams(totals, teams, div_container, hitters_fn, pitchers_fn) {
    const ENDING = x => (Math.abs(x) === 1 ? "" : "s")
    // Make the headers & lists for teams
    totals.slice().sort((x, y) => x - y)
        .filter((total, pos, array) => !pos || total !== array[pos - 1])
        .forEach(function(total) {
            div_container.insertAdjacentHTML("afterbegin",
                `<h1>${total} player${ENDING(total)}</h1>
                 <ul id="${div_container.id}_tlist${total}"></ul>`)
    })
    // Put the teams in the lists
    teams.forEach(function(team, pos) {
        let hitters = hitters_fn(team)
        let pitchers = pitchers_fn(team)
        document.getElementById(div_container.id + "_tlist" + totals[pos])
            .insertAdjacentHTML(
                "beforeend", 
                `<li>${team.fullName} 
                (${hitters} hitter${ENDING(hitters)},
                 ${pitchers} pitcher${ENDING(pitchers)})</li>`
            )
    })
}
