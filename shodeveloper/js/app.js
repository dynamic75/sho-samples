/*
    Author: Damian McCleod
    Date: 5/13/
    One page app, creates wrapper functions around Delicious JSON api
*/



!(function($){   
    
    var shoDev = shoDev || {};
    
    _.extend(shoDev, {
        baseUrl: "http://feeds.delicious.com/v2/json/shodeveloper",
        tags_container: $("#dl-tags"),
        tags: []
    });
    
    function initialize(){
       getTags();        
    }    
            
    function getTags(){
        
        $.ajax({
            url: shoDev.baseUrl,
            crossDomain: true,
            dataType: "jsonp",
            success: function(data){
                shoDev.links = data;
                sortTags();
            }
        })
    } 
    
    function sortTags(){
        _.each(shoDev.links, function(link){
            shoDev.tags.push(link.t)
        })
        console.log(shoDev.tags)
        var flat = _.flatten(shoDev.tags)
        console.log(flat)
        //_.uniq(tags);
    }     
    
    initialize()    
      
   
})(jQuery)


/*
// working jsponp example

var url = "http://feeds.delicious.com/v2/json/shodeveloper";

$.ajax({
    url: url,
    crossDomain: true,
    dataType: "jsonp",
    success: function(data){
        console.log(data);
    }
})
*/
