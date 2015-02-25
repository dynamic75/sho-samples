/*
	JS
	--------------------------------------------------------------------------------------------  
	@site   			sho.com <rebuild>
	@project	    	accounts
	@file		        accounts/js/accounts/avatar_modal.js
	@author				dmccleod
	@modified			10.18.11
	@desc		        class for opening and handling a modal to select a Sho.com avatar
	@note               --

	/* =: accounts
	-------------------------------------------------------------------------------------------- */

	sho.provide('sho.accounts');
	/**
     * sho.accounts 
     * namespace for accounts code
    **/

	/** 
	 *  class sho.accounts.AvatarModal < sho.ui.modals.Base
	 *  Builds and adds handlers for the avatar model in a user's profile: create and update page
	 **/
	sho.accounts.AvatarModal = Class.create(sho.ui.modals.Base, {
				
		_KLASS_ : 'sho.accounts.AvatarModal',

		avatarContainer: new Template(
			'<div id="chooseAvatarModal" class="act_inner">'+	        
				'<div class="avatar_wrapper" id="slider1">#{ul_slices}</div>'+
				'<section>'+
					'<a class="button" rel="cancel">cancel</a>'+
					'<a class="button" rel="okay">okay</a>'+
					'<p id="avatarName"></p>'+
					'<p id="avatarSelectionMsg"></p>'+
					'<div id="avatar_pagination"></div>'+
				'</section>'+
			'</div>'),
			
		avatarList: new Template('<ul>#{li}</ul>'),		

		avatarTemplate : new Template('<li id="#{id}" path="#{path}" title="#{label}"><img src="#{path}" width="50" height="50" alt="#{label}" /></li>'),

		pageLinks: new Template('<li><a href="\##{pgNum}">#{pgNum}</a></li>'),
			
		avatar_json_url :  '/rest/accounts/avatars',
		
		data: null,
		
		// sho.accounts.AvatarModal.currentSelection -> Element
		currentSelection: null,
		
		//sho.accounts.AvatarModal.currentSelection -> id of currentSelection
		current_selected_ID: null,
		
		//sho.accounts.AvatarModal.dimensions -> Object, contains properties for width and height
		dimensions: null,
		
		//sho.accounts.AvatarModal.dimensions -> Object, contains properties for width, height, title and initial HTML content
		defaults: {
			height: 253,
			width: 590,
			title: 'Select an Avatar',
			content: '<p class="loading">Loading...</p>'				
		},
						
		/* =:runtime
        -------------------------------------------------------------------------------------------- */
		loadAvatarJSON: function(){
			var req = new Ajax.Request( this.avatar_json_url, {
			  method: 'get',
			  onSuccess: this.onAvatarDataLoad.bind(this)
			});
		},
		
		/*
		  sho.accounts.AvatarModal#onAvatarDataLoad(JSON object) -> Null
		  Creates a an Array of avatars by evaluating the JSON object
		  Divides the Array of avatars into a list of 27 avatars per row
		  Each avatar is evaluated into a <li> element using the avatarTemplate
		  the list of avatars is then appended to the avatarContainer template and added to the markup of the modal		
		*/			
		onAvatarDataLoad: function(transport) {		    
			var th=this;
		    this.data = Object.values(transport.responseText.evalJSON()); if(!this.data.length) return;
		    var avatars = this.data[0].pluck('imageSize_50').flatten(); if(!avatars.length) return;
			var pageNumber = [];
			var list = avatars.eachSlice(27,function(slice){				
				return slice.collect(function(li){					
					return th.avatarTemplate.evaluate(li)
				})
			}).collect(function(uls){				
				return th.avatarList.evaluate({li: uls})
			}).join('').replace(/,/g, '');			
				  
			this.setContent(this.avatarContainer.evaluate({ul_slices: list, pageLinks: pageNumber.join('')}));
			this.getModalElements();
			
			/*
			  bxSlider({config object}) -> Null
			  A JQUERY plugin that adds pagination to an element passed into to it's config object
			*/
			$j('#slider1').bxSlider({
				infiniteLoop: false,
				controls: false,
				pager: true,
				pagerSelector: $j('#avatar_pagination'),
				pagerActiveClass: 'currentPg'
			});
		},
			
		refresh: function($super){
			$super();
			this.loadAvatarJSON();
		},
		
		update:function($super, e){
			$super(e); // for standard modal events ie close and body click
            if(e.eventName == 'modal:click') this.avatarClickHandler(e.event.findElement('li'));
			if(e.eventName == 'modal:hover') this.avatarHoverHandler(e.event.findElement('li'));
        },
		
		/*
		  sho.accounts.AvatarModal#avatarClickHandler -> Null         
          Adds a 'click' event handler to each <li> element in the avatar modal.
		  A text field referenced by the property avatarName in the class, is updated to display the name of the avatar
		  based on the selected <li> id property
        */		
		avatarClickHandler: function(li){			
			if(!li) return
			if(this.currentSelection) this.currentSelection.removeClassName('selected');		
			li.addClassName('selected');
			this.current_selected_ID = li.readAttribute('id');	
			this.newPath = li.readAttribute('path');
			this.currentSelection = li;
			this.avatarName.update(li.readAttribute('title')).morph('opacity:50',{
				transition: 'easeInOutExpo',
				duration: 1
			});
			if(!this.message.empty()) this.message.fade();			
		},
		
		/*
		  sho.accounts.AvatarModal#avatarHoverHandler -> Null         
          Adds a 'hover' event handler to each <li>, which increases it's opacity
        */
		avatarHoverHandler: function(li){			
			if(!li) return;
			if(li.readAttribute('title') != null) var title = li.readAttribute('title');
			this.avatarName.update(title).morph('opacity:50',{
				transition: 'easeInOutExpo',
				duration: 1
			});
		},
		
		//sho.accounts.AvatarModal#getModalElements -> Null, adds modal elements and attaches their handlers to the DOM
		getModalElements: function(){		
			var th = this;
			if(!($('avatarName')) || !($('avatarSelectionMsg')) || !($('avatarId'))) return;
			this.avatarName = $('avatarName');
			this.message = $('avatarSelectionMsg');
			this.hiddenInput = $('avatarId');
			this.profileAvatar = $('myAvatar');			
			this.currentAvatarId = this.profileAvatar.readAttribute('rel');
			this.defaultPath = this.profileAvatar.readAttribute('src');			
			this.list = $$('#chooseAvatarModal ul li');			
			this.cancelBtn = $$('.button[rel^="cancel"]')[0].observe('click',function(){
				th.close();
			});
			this.okBtn = $$('.button[rel^="okay"]')[0].observe('click',function(e){				
				e.stop();
				if(th.newPath != undefined) {
					th.profileAvatar.writeAttribute('src', th.newPath);
					if(th.current_selected_ID != null) th.hiddenInput.writeAttribute('value', th.current_selected_ID);
					th.close();
				} else { 					
					th.message.update('You have not selected an avatar.');
					th.message.appear();			
				}	
			});
		}
		
	});
	

