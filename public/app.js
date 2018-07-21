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



$(".save").on("click", function(event){   // Save article button
    id = $(this).attr('data');
    $(this).attr('data-state', 'true');
    $(this).addClass('disabled');
    $(this).text('SAVED!');
    $.ajax({
        method:"POST",
        url: "/saved/" + id,
    }).then(function(){
        console.log('Article id: '+ id + ' has been saved!');
    })
})

$(".unsave").on("click", function(){
    console.log("saved success");
    //Run
    // id = $(".save").attr("data")
    // console.log(id)
    id = $(this).attr("data")
    console.log(id)
    $.ajax({
        method:"POST",
        url: "/unsaved/" + id,
    }).then(function(){
        $(this).hide();
        location.reload()
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
    id = $(this).attr('data');
    loadNotes(id)
})

function loadNotes(id) {
    $(".savedNotes").empty();
    id = id;
    $("#submitNote").attr("data", id);
    $.ajax({
        method: "GET",
        url: "/articles/" + id
    }).then(function(data){
        console.log(data);
        $.each(data.notes,function (index, value){
            $('.savedNotes').append('<div><p>' + (index+1) + ': ' + value.body + '</p></div>');
        });
    });
    $('.modal').modal('show');
}

$("#submitNote").on("click", function() {
    console.log("Actively saving note");
    id = $(this).attr("data")
    console.log(id)
    $.ajax({
        method: "POST",
        url: "/articles/" + id,
    }).then(function(data){
        console.log(data)
        console.log("save complete")
        $('.modal').modal('hide')
    })
})

$(document).on("click", '#submitNote', function() {
    id = $(this).attr("data");
    console.log(id)
    $.ajax({
        method: "POST",
        url: "articles/" + id,
        data: {
            body: $("#mynote").val()
        }
    }).then(function(data){
        console.log("Note has been saved!");
        $('.modal').modal('hide');
    }).then(function() {
        loadNotes(id);
    })
    $('#mynote').val('');
});