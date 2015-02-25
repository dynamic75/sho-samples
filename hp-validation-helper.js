	/*
	JS
	--------------------------------------------------------------------------------------------  
	@site   			sho.com <rebuild>
	@project	    	_		<mobile>
	@file		        happyformhelper.js
	@author				dmccleod
	@modified			02.20.13
	@desc		        helper validation functions for vendor script happy.js

	/* =:sho  
	-------------------------------------------------------------------------------------------- */

	sho.provide('sho.accounts');
	sho.accounts.HappyFormHelper = function(){
	    		
		var emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		var fourDigitRegEx = /\b\d{4}\b/;
		var latinRegEx = /[\u0000-\u007f]/;
		var validationStatus = true;
		
		/* 
		 * form inputs can contain a type="email" or data-rangelength but not both since the happy js only accepts one test function per field
		 * buildFormConfig builds a custom config object for each form that is passed, then the config is passed to validateForm to be validated
		*/
		function buildFormConfig(form)
		{   
			var cfg = {}, required, testFunc;
			cfg.fields = {};			
			cfg.form = form;		
			cfg.parentId = $(form).attr('id');
			// add next button to the cfg object if the form is the first card in registration
			// happy js will add the submit event handler to the next button
			cfg.submitButton = (cfg.parentId == 'card0') ? "#nextCard" : null;
		
			cfg.form.find('[data-required]').each(function(i, item){				
				// add the parent form id as an attribute to the field, the elements data attribute and the parent form id are evaluated in happy.js
				// this is used to keep validation in the scope of the form the element belongs to
				$(item).attr('data-parent-id', cfg.parentId);
											
				//if the required attribute is "true" return the boolean true or the string value
				required = ($(item).data('required') == "true") ? true: $(item).data('required');					
				cfg.fields['#'+item.id+''] = {
					'required': required,
					'message' : ($(item).data('error-message') || '')
				 };
				
				// the native .bind() was causing errors in Android devices and allowing the submission of the form without trapping errors;
												
				if($(item).data('rangelength') ) cfg.fields['#'+item.id]['test'] = $.proxy(validateNumRange, $(item));				
				
				if($(item).data('type') == 'email') cfg.fields['#'+item.id]['test'] = $.proxy(validateEmail, $(item));
				
				if($(item).data('default-option')) {				
					cfg.fields['#'+item.id]['test'] = $.proxy(validateIsDefaultSelected, $(item));
				}				
				
				// subscription does not require validation, but support for radio button validation may be added in later
				//if($(item).data('type') == 'radio') cfg.fields['#'+item.id]['test'] = validateIsRadioChecked.bind($(item));							
			});
			
			validateForm(cfg); 
		}
										
		function validateForm(cfg)
		{	
			cfg.form.isHappy({
				fields: cfg.fields,
				parentId: cfg.parentId,
				submitButton: cfg.submitButton,
				unHappy: function(){				
					sho.accounts.HappyFormHelper.validationStatus = false;										
				}
			});
		}
		/*	
		 * ___________________________________________ HELPER FUNCTIONS ___________________________________________
		*/
		function validateEmail(email)
		{	
			if( !/@/.test(email)  || //should contain the @ symbol			            
                /^@/.test(email)  || //should not start with @
                /@$/.test(email)  || //should not end with @
                email.split('@').length != 2  || //should not contain more than one @
                email.length >= 255 // should not be longer than 254 characters
                ) return false;
                return true;
		}
		
		/* num expects a string in the value of the rangelength attribute in the form of "6,15"
		 * where 6 is the min length and 15 is the max length.
		*/ 
		function validateNumRange(val)
		{			
			if(this.attr('id') == 'birthYear') return fourDigitRegEx.test(val); 
			
			var range = this.data('rangelength').split(',');
			textLength = val.length;	
					
			min = range[0];
			max = range[1];
			if(textLength <= max && textLength >= min) { return true;
			} else return false					
		}
		
		function validateBirthYear(year){
			return fourDigitRegEx.test(year)
		}
		
		// check whether the user has selected an option besides the first default value from a select drop down
		function validateIsDefaultSelected()
		{				
			var th = $(this);
			if($(th.children()[0]).attr('value') == th.val() ) {
				return false;
			} else return true	
		}

		function validateIsRadioChecked()
		{	
			var radios = $(this).parent().children('[type*="radio"]');
			return (_.filter(radios,function(rd){
				return $(rd).prop('checked');
			}).length != 0)		
		}
				
		function checkAllFieldsAreValid(link)
		{	
			if(link) { 
				return _.some($(link).parent('.card').find('.unhappy'), function(i){						
					return $(i).hasClass('unhappy')
				});
			} else return ($('.unhappy').length > 0) ? true : false;
		}
		
		return {
			validateEmail: validateEmail,
			validateNumRange: validateNumRange,
			validateForm: validateForm,
			buildFormConfig: buildFormConfig,
			validateIsDefaultSelected: validateIsDefaultSelected,
			validateIsRadioChecked: validateIsRadioChecked,
			checkAllFieldsAreValid: checkAllFieldsAreValid
		}
			
	}(sho.$)
