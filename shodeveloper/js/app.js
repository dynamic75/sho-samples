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
        results_container: $("#display-results"),
        results_title: $(".panel-title"),
        tagsLink: $("#tags-link"),
        bookmarksLink: $("#bookmarks-link"),
		tags: []
    });
    
    function initialize(){
       getBookMarks();
       setLinkHandlers();        
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
				shoDev.tags = _.uniq(_.flatten(shoDev.tags));				
            }
        })
    } 
	
	function displayTagLinks(){
	    shoDev.results_container.html("");
		_.each(shoDev.tags, function(tag,i){
			shoDev.results_container
			 .append($("<a></a>")
			 .attr({"data":tag, "href": "#"+tag})
			 .text(tag))
		})
	}
	
	function displayBookmarks(){
	    shoDev.results_container.html("<ol></ol>");
	    var li;
	  _.each(shoDev.bookMarks, function(b,i){
	      li = ['<li><a href="', b.u,'"','target="_blank">',b.d,"</a></li>"].join('');      
	      shoDev.results_container.find("ol").append( $(li) );
	      //shoDev.results_container.append( $(li) );	      
	    })
	    //console.log(shoDev.results_container.find("ol"))  
	}	
	
	function setLinkHandlers(){
	    shoDev.tagsLink.on("click", function(e){	        
	        e.stopPropagation();
	        if(shoDev.results_title.attr("data") == "all-tags") return	        
	        shoDev.results_title.html("All Tags").attr("data", "all-tags")
	        displayTagLinks();
	    });
	    shoDev.bookmarksLink.on("click", function(e){	        
	        e.stopPropagation();
	        if(shoDev.results_title.attr("data") == "all-bookmarks") return	        
	        shoDev.results_title.html("All Bookmarks").attr("data", "all-bookmarks")
	        displayBookmarks();
	    })
	}    
    
    initialize();    
      
   
})(jQuery)
