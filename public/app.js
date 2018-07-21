//On click to do the scrape and post to our table
$('#scrapeNow').click(function() {    
    console.log("Success!")
    //Runs the 
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).then(function(data){
        console.log(data)
        window.location = "/"
    })
})


$(".save").on("click", function(){
    console.log("saved success");
    //Run
    // id = $(".save").attr("data")
    // console.log(id)
    id = $(this).attr("data")
    console.log(id)
    $.ajax({
        method:"POST",
        url: "/saved/" + id,
    }).then(function(){
        $(this).attr("style", "display:none")
    })
})


$("#saved_articles").on("click", function(){
    console.log("retrieving saved articles")
    $.ajax({
        method: "GET",
        url: "/saved"
    }).then(function(data) {
        console.log("saved data " + data)
        window.location = "/saved"
    })
})

$('.note').on('click', function () {
    $("#submit").attr("data", $(this).attr("data"));
    $('.modal').modal('show')
})

$("#submit").on("click", function() {
    console.log("Actively saving note");
    id = $(this).attr("data")
    console.log(id)
    $.ajax({
        method: "POST",
        url: "articles/" + id,
    }).then(function(data){
        console.log(data)
        console.log("save complete")
        $('.modal').modal('hide')
    })
})