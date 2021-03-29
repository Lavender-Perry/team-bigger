let request = new XMLHttpRequest()
request.open(
    "GET",
    "https://cors-proxy.blaseball-reference.com/database/allTeams",
    true)
request.send();

request.onload = function() {
    let teams = JSON.parse(this.response)
    let totals = teams.map(team => team.lineup.length + team.rotation.length)
    // Get all player counts that there are from greatest to least
    // & make headers & lists for them
    totals.slice().sort((x, y) => y - x)
        .filter((item, pos, array) => !pos || item != array[pos - 1])
        .forEach(function(item) {
            document.body.insertAdjacentHTML("beforeend",
                `<h1>${item} player${(item > 1 ? "s" : "")}</h1>
                <ul id="tlist${item}"></ul>`)
    })
    // Put the teams in the lists
    teams.forEach(function(item, pos) {
        document.getElementById("tlist" + totals[pos]).insertAdjacentHTML("beforeend", 
            `<li>${item.fullName} 
            (${item.lineup.length} hitter${(item.lineup.length > 1 ? "s" : "")},
             ${item.rotation.length} pitcher${(item.rotation.length > 1 ? "s" : "")})</li>`)
    })

    document.getElementById("progress").remove()
}
