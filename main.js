var request = new XMLHttpRequest()
request.open("GET", "https://cors-proxy.blaseball-reference.com/database/allTeams", true)
request.send();

request.onload = function() {
    var teams = JSON.parse(this.response)
    var totals = teams.map(team => team.lineup.length + team.rotation.length)
    // Get all player counts that there are from greatest to least
    var playercounts = totals.slice().sort(
        function (x, y) {
            return y - x
        }
    ).filter(
        function (item, pos, array) {
            return !pos || item != array[pos - 1]
        }
    )

    // Now make headers & lists for all the player counts
    playercounts.forEach(function(item) {
        document.body.insertAdjacentHTML("beforeend", "<h1>" 
                                                      + item 
                                                      + " players</h1><ul id='tlist"
                                                      + item
                                                      + "'></ul>")
    })
    // Put the teams in the lists
    teams.forEach(function(item, pos) {
        document.getElementById("tlist" + totals[pos]).insertAdjacentHTML("beforeend", "<li>" 
                                                                                       + item.fullName
                                                                                       + " ("
                                                                                       + item.lineup.length
                                                                                       + " hitters, "
                                                                                       + item.rotation.length
                                                                                       + " pitchers)</li>")
    })

    document.getElementById("progress").remove()
}
