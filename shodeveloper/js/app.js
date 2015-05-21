/*
    Author: Damian McCleod
    Date: 5/13/
    One page app, creates wrapper functions around Delicious JSON api
*/

!(function($){   
    
    window.shoDev = window.shoDev || {};
    
    _.extend(shoDev, {
		user: "shodeveloper",
        baseUrl: "http://feeds.delicious.com/v2/json/",
        tags_container: $("#dl-tags"),
		tags: []
    });
    
    function initialize(){
       getBookMarks();        
    }    
            
    function getBookMarks(){  
        $.ajax({
            url: shoDev.baseUrl + shoDev.user,
            crossDomain: true,
            dataType: "jsonp",
            success: function(data){
				shoDev.bookMarks = data;
                _.each(data, function(v,i){
					shoDev.tags.push(v["t"])	
                })
				shoDev.tags = _.uniq(_.flatten(shoDev.tags))
				console.log(shoDev.tags)
				createTagLinks();
            }
        })
    } 
	
	function createTagLinks(){
		var anchor = $("<a></a>");
		_.each(shoDev.tags, function(tag,i){
			anchor.attr({"data": tag, "text": tag});
			$(shoDev.tags_container).append(anchor)
		})
	}    
    
    initialize()    
      
   
})(jQuery)
