
/*
JS
--------------------------------------------------------------------------------------------  
@site   			sho.com <rebuild>
@project	    	accounts
@file		        accounts/js/accounts/utils.js
@author				dmccleod
@modified			2.02.12
@desc		        class for managing function ui with in accounts
@note               --

/* =: accounts
-------------------------------------------------------------------------------------------- */  
	
	/**
     * sho.accounts 
     * namespace for accounts code
    **/
	sho.provide('sho.accounts');
		
	/**
	 * class sho.accounts.Utils
	**/
	sho.accounts.Utils = Class.create({		
		
		/**
		 * sho.accounts.Utils._KLASS_ -> String
		**/
		
		_KLASS_ : 'sho.accounts.Utils',
	
		/** 
		 * sho.accounts.Utils#birthdayInputHelper() -> null
		 * If an input field has more than the specified amount of characters, delete the extra characters on the 'blur' event.
		 * Clears the default value of a input on the 'focus' event
		**/		
		birthdayInputHelper: function(){		
			var inputs = $$('#DOB-fieldWrapper input'), placeVals= $w('MM DD YYYY');
			inputs.each(function(x,i){				
				if(x.readAttribute('readonly') == 'readonly' || x.readAttribute('readonly') == 'true' || x.readAttribute('readonly') != null ) return
				
				x.observe('blur',function(e){	//keyup:  causing problems in Safari and FF					
					if($F(x).length > 2 && i!= 2) {
						x.setValue($F(x).substr(0,2));
					} else x.setValue($F(x).substr(0,4));
				})
				if(sho.isIOS5()) {
					x.observe('focus', selectMe.bind(x));
				}
			});
						
			function selectMe(){ 
				var th = this;
				if(placeVals.any(function(pv){ return pv == th.readAttribute('placeholder')})) {	
					th.clear();						
				} else {
					(function() { th.select() }).defer();			
				}				
			}			
		},
		
		/**
		 * sho.accounts.Utils#toggleProviderSelect() -> null
		 * in users/new and users/edit page, this funciton will toggle the visibility of the subscriber <select> pull down
		 * based on the 'yes' and 'no' radio button's value
		**/					
		toggleProviderSelect: function(){
			var selectWrapper = $('tvProvider'), providerSelect = $('userSelectedProvider');
			if($$('input[name^="subscribeToShowtime"]')[0].getValue() == "true" ) {
				selectWrapper.appear();
			} else selectWrapper.hide();
			var suscribeRadios = $$('input[name^="subscribeToShowtime"]').each(function(radio){
				radio.observe('click', function(e){					
					if($F(this) == 'true') {						
						selectWrapper.show()//appear()
					} else {
						selectWrapper.hide()//fade()
					}	
				});
			});
		},
		/**
		 * sho.accounts.Utils#openSelectAvatarModal() -> null
		 * opens the sho avatar modal window		
		**/	
		openSelectAvatarModal: function(){
			var th = this;
			var chooseAvatarLinks = [ {ele: $('imgSelectAvatar')}, {ele: $('selectAvatar')}	].each(function(x){
				x.ele.observe('click',function(e){
					e.stop();
					sho.ui.modals.create({
					    'type' : 'avatar-modal'
					});
				});					
			});
		},
		
		/**
		 * sho.accounts.Utils#showUploadAvatar() -> null
		 * toggles the visibility of the upload avatar file input	
		**/
		showUploadAvatar: function(){			
			var inputWrapper = $('custom-input-wrapper').show();			
			var position;			
			var addLink = $('addMyAvatar').observe('click', function(e){				
				position = (inputWrapper.getStyle('top') ==  '0px') ? '-60px':'0px';				
				inputWrapper.morph('top:'+ position +';',{
					duration: .3,
					propertyTransitions: { top: 'easeInOutBack' },
					before: function(){	
						e.target.toggleClassName('subtract');				
					}
				});
			});			
		},
		
		/**
		 * sho.accounts.Utils#aboutUserErrorCSS() -> null
		 * adds error class to the wrapper element of the textarea for the about section
		**/
		aboutUserErrorCSS: function(){
			var child, parent;
			child = $$('.textAreaPadding')[0].down('textarea'); parent = child.up('.textAreaPadding');
			if(child.hasClassName('error')) {child.removeClassName('error'); parent.addClassName('error')
			} else if(!child.hasClassName('error') && parent.hasClassName('error')) parent.removeClassName('error')
		},
		
		/**
		 * sho.accounts.Utils#initSocialize() -> null
		 * initialize the social widgets on the accounts confirmation page
		**/	
		initSocialize: function(){ 
			$$('ul.socialize-icons li').each(function(s) { 
				var overlayElements = s.select('.socialize-overlay', '.socialize-overlay-tail');
				var overlayOpen = s.select('.socialize-link')[0];
			  	var socializeOverlay = new sho.series.socialize.Overlay({
					'container' : $$('.content')[0],
					'overlayOpen' : overlayOpen,
					'overlayElements' : overlayElements,
					'overlayClose' : overlayElements[1]
				}); 	
			});	
		}			
	
	});
		

	/* No surrender, No delete! */
