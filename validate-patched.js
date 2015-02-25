//
// +----------------------------------------------------------------------+
// | Unobtrusive Javascript Validation for Prototype. v2.0 (2007-03-04)   |
// | http://blog.jc21.com                                                 |
// +----------------------------------------------------------------------+
// | Attaches Events to all forms on a page and checks their form         |
// | elements classes to provide some validation.                         |
// +----------------------------------------------------------------------+
// | Copyright: jc21.com 2008                                             |
// +----------------------------------------------------------------------+
// | Licence: Absolutely free. Don't mention it.                          |
// +----------------------------------------------------------------------+
// | Author: Jamie Curnow <jc@jc21.com>                                   |
//+----------------------------------------------------------------------+
//
//

if (typeof(JSV) == 'undefined') {
    var JSV = false;

    /* :NOTE: All advanced JSV JS functionality is assumed to require the Prototype JS library */
    if (typeof($) == 'function') {
        JSV = {
            Init:     { },
            Validate: { },
            Lang:     { },
			shoHelp:  { }
        };
    }

    if (JSV) 
    {
    /*
    =:init */

        JSV.Init = {
	
            initialisers: [ ],
            unloaders: [ ],

            add: function(add_fn) {
                JSV.Init.initialisers.push(add_fn);
            },

            addUnloader: function(add_fn) {
                JSV.Init.unloaders.push(add_fn);
            },

            remove: function(remove_fn) {
                var last_init = JSV.Init.initialisers.length - 1;
                for (var i = last_init; i >= 0; i--) {
					if (JSV.Init.initialisers[i] === remove_fn) JSV.Init.initialisers[i] = null;
                }
            },

            removeUnloader: function(remove_fn) {
                var last_unloader = JSV.Init.unloaders.length - 1;
                for (var i = last_unloader; i >= 0; i--) {
					if (JSV.Init.unloaders[i] === remove_fn) JSV.Init.unloaders[i] = null;
                }
            },

            run: function() {
                var last_init = JSV.Init.initialisers.length - 1;
                for (var i = 0; i <= last_init; i++) {
					if (typeof(JSV.Init.initialisers[i]) == 'function') JSV.Init.initialisers[i]();
                }
            },

            runUnload: function() {
                var last_unloader = JSV.Init.unloaders.length - 1;
                for (var i = 0; i <= last_unloader; i++) {
					if (typeof(JSV.Init.unloaders[i]) == 'function') JSV.Init.unloaders[i]();
                }
            }
        };

        /*
        =:sho */
		JSV.shoHelp = 
		{	
			labels: [],
			errorArray: [],
			currentForm: { 
				form: null,
				frontErrors: null
			},
			
			// get all the labels and .label  associated with the passed form
			getFormLabels: function(form){
				this.labels = form.select('.label', 'label'); 
			},
			// toggles the presence of the "error" class name when validating each form element
			addLabelClass: function(ele){
				this.labels.each(function(l){
					if(l.hasClassName("error")) return			
					if(ele.readAttribute('id') == l.readAttribute('for') || ele.readAttribute('id') == l.readAttribute('for2')) l.addClassName("error");
				});
			},
			removeLabelClass: function(ele){
				this.labels.each(function(l){
					if(ele.readAttribute('id') == l.readAttribute('for')) l.removeClassName("error");
				});
			},
			// if the error message <span> is already in the page, add front end error message under it,
			// if not create <span> and place in DOM before form
			getErrorContainer: function(form){
				this.currentForm = form;			
				if(form.adjacent('.errorMsg').length > 0) {
					if(form.select('.errorMsg')[0].nextSiblings().any(function(n){ return n.hasClassName('frontErrorMsg')}) ){
						this.currentForm.frontErrors = form.select('.frontErrorMsg')[0];
					} else this.currentForm.frontErrors = this.insertErrorContainer(form.select('.errorMsg')[0],'after');
				} else if(form.adjacent('.frontErrorMsg').length > 0) {
					this.currentForm.frontErrors = form.adjacent('.frontErrorMsg')[0];
				} 				
				return this.currentForm.frontErrors;				
			},
			
			insertErrorContainer: function(ele, placement){
				var err = new Element('span', {'class': 'frontErrorMsg'});
				var cfg = (placement == 'after' ? {after: err} : {before: err});						
				ele.insert(cfg);					
				return ele.adjacent('.frontErrorMsg')[0];
			},
			
			formatErrorMessage: function(m){
				var th = this;		
				
				if(!sho.accounts.ErrorsPresent) sho.accounts.ErrorsPresent = true;					
				if(JSV.backEndError) JSV.backEndError.update(""); //also clear back end errors					
				if(JSV.initialError != null) {
					JSV.initialError.each(function(err){ err.removeClassName("error") });
					JSV.initialError = null;
				}			
				if(this.currentForm.frontErrors) {
					this.currentForm.frontErrors.update("");
				} else {					
					this.currentForm.frontErrors = this.insertErrorContainer(this.currentForm,'before');
				}
												
				m.each(function(x){
					if(th.currentForm.frontErrors.innerHTML.indexOf(x) != -1) return //do no write duplicate front end error messages					
					th.currentForm.frontErrors.insert({bottom: x + "<br>"});
				});					
			},
			checkBackEndErrors: function(obj){					
				if(obj.error != undefined) {
					if(obj.error.identify().indexOf("error") != -1) JSV.backEndError = obj.error;
					sho.accounts.ErrorsPresent = true;
				} 
				if(obj.form.select(".error").length > 0) { 
					JSV.initialError = obj.form.select(".error").reject(function(err){
						return err.nodeName.toLocaleLowerCase() == "label" || err.hasClassName("label");
					})
				}											
			}
		};
        
        /*
        =:validate */
        JSV.Validate = {	
            initialised: false,

            init: function() {							
                if (!JSV.Validate.initialised) {
					$$('form.has-validation').each(function(elm) {
						Event.observe(elm, 'submit', JSV.Validate.checkForm);								
					});
					JSV.Validate.initialised = true;								
                }
            },
		
            checkForm: function(e) {						
				var all_valid = true;
                var errs      = new Array();
            	var frm       = e.element();
                var frm_elms  = frm.getElements();				
				var errorContainer = JSV.shoHelp.getErrorContainer(frm);					
				JSV.shoHelp.getFormLabels(frm);	
					
				if(!frm.trackedEvents) frm.trackedEvents = {};								
				frm.trackedEvents[e.type] =[]
				frm.trackedEvents[e.type].push(JSV.Validate.checkForm);
							
            	frm_elms.each(function(elm) {
            	    var apply_classes = true;
            	    var valid         = true;
					// if the element is a textarea, use it's parent container to apply validation classnames
					var text_parent = (elm.up('.textAreaPadding') !== undefined) ? elm.up('.textAreaPadding') : false;	
											
            	    if (JSV.Validate.isVisible(elm)) {	                	    
						if (elm.nodeName.toLowerCase() == 'input') {
                	        var type  = elm.type.toLowerCase();
                	        if (type == 'text' || type == 'password') {
                                valid = JSV.Validate.input(elm);
                            } else if (type == 'radio' || type == 'checkbox') {
                                valid = JSV.Validate.radio(elm, frm);
                            }
                	    } else if (elm.nodeName.toLowerCase() == 'textarea') {
                            valid = JSV.Validate.input(elm);
                        } else if (elm.nodeName.toLowerCase() == 'select') {
                            valid = JSV.Validate.select(elm);
                        } else {
                            apply_classes = false;
                        }

                        if (valid && apply_classes) {
        					elm.removeClassName('validation-failed');
        					elm.addClassName('validation-passed');
							// remove "error" class name to elements corresponding label
							JSV.shoHelp.removeLabelClass(elm);
        				} else if (apply_classes) {
        					elm.removeClassName('validation-passed');								
							elm.addClassName('validation-failed');
							//extra line of validation at bottom of form next to submit buttons
							if($('extravalidation')) $('extravalidation').removeClassName('hiddentext');								
							// add "error" class name to elements corresponding label
							JSV.shoHelp.addLabelClass(elm);
							
							// was 'getAttribute('title'), but this causes some browsers (IE) to
							// show an error-message-like element before user has done anything 
							// (title attributes are treated similar to how alt attributes on images work)
        					
        					//try to get title for error message
        					var errorMessage = elm.getAttribute('data-error-message') || elm.getAttribute('title'); if(errorMessage)
        					{
        						errs[errs.length] = errorMessage
        					}
        					all_valid = false;
        				}
            	    }
					// for clearing the error class on hidden elements	
					if (!JSV.Validate.isVisible(elm) && elm.hasClassName('validation-failed')) {				
						elm.removeClassName('validation-failed');
						JSV.shoHelp.removeLabelClass(elm);
					}	
            	});

            	if (!all_valid) 
            	{
            	    e.stop();				
            	    if (errs.length > 0){
						JSV.shoHelp.formatErrorMessage(errs);										
            		}
            	    if (sho.$('.frontErrorMsg').length == 0) {
            	            errorContainer.insert({
							bottom: JSV.Lang.getString('error_message_default')
						});
            	    }
            	             		
            	}			
            	return all_valid;
            },

            isVisible: function(elm) {
                if (typeof elm == "string") {
            		elm = $(elm);
            	}
            	while (elm.nodeName.toLowerCase() != 'body' && elm.getStyle('display').toLowerCase() != 'none' && elm.getStyle('visibility').toLowerCase() != 'hidden') {
            		elm = elm.parentNode;
            	}
            	if (elm.nodeName.toLowerCase() == 'body') {
            		return true;
            	} else{
            		return false;
            	}
            },

            input: function(elm) {
            	var text  = elm.value.strip();
								
            	if (elm.hasClassName('required') && text.length == 0) {
            	    return false;
            	} else if (elm.hasClassName('password-length') && text.length < 6) {
	                return false;
				} else if (elm.readAttribute('name') == 'zipcode' && text.length != 5){
					return false;					
				} else if (elm.hasClassName('required')) {
                    var m = elm.getAttribute('minlength');
            		if (m && Math.abs(m) > 0){
            			if (text.length < Math.abs(m)){
            				return false;
            			}
            		}
                } else if (text.length == 0) {
                    return true;
                }

                //search for validate-
                if (elm.hasClassName('validate-number') && isNaN(text) && text.match(/[^\d]/)) {
                    //number bad
                    return false;
                } else if (elm.hasClassName('validate-digits') && text.replace(/ /,'').match(/[^\d]/)) {
                    return false;
                } else if (elm.hasClassName('validate-alpha') && !text.match(/^[a-zA-Z]+$/)) {
                    return false;	
                } else if (elm.hasClassName('validate-alphanum') && !text.match(/\W/)) {
                    return false;
                } else if (elm.hasClassName('validate-date')) {
            		var d = new date(text);
            		if (isNaN(d)) {
            			return false;
            		}
            	} else if (elm.hasClassName('validate-email') ) { log('call validateEmail()')
            	    return this.validateEmail(text);            		
            	} else if (elm.hasClassName('validate-url') && !text.match(/^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i)) {
            		return false;
            	} else if (elm.hasClassName('validate-date-au') && !text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)) {
            		return false;
            	} else if (elm.hasClassName('validate-currency-dollar') && !text.match(/^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/)) {
            		return false;
                } else if (elm.hasClassName('validate-regex')) {
                    var r = RegExp(elm.getAttribute('regex'));
                    if (r && ! text.match(r)) {
                        return false;
                    }
                // http://stackoverflow.com/questions/2550951/what-regular-expression-do-i-need-to-check-for-some-non-latin-characters    
                } else if (elm.hasClassName('validate-is-latin')){
                    return !!text.match(/[\u0000-\u007f]/);
                }
                return true;
            },
            
            validateEmail: function(email){
                if(email.indexOf('@') != -1){ //check the email contains @
                    //log('contains @')
                    if(email.indexOf('@') != 0 && email.substr(email.length -1) != '@') { //check the email does not start or end with @                      
                        //log('does not start or end with @')
                        if(email.split('@').length == 2) { //check there is not more than 1 @                
                            //log('does not contain more than 1 @')
                            if(email.length <= 254) { //check the length of the email is not longer than 254 characters
                                //log('lenght is not longer than 254 characters')
                                return true; 
                            } else return false; //longer than 254 characters  
                        } else return false; //contains more than one @ symbol                                     
                    } else return false; //starts or ends with @ symbol                        
                } else return false; //does not contain the @ symbol                
            },

            radio: function(elm, frm) {
                var valid = true;
            	//search for required
            	if (elm.hasClassName('validate-one-required')) {
            		//check if other checkboxes or radios have been selected.
            		valid = false;
            		frm.select('input[name="'+elm.name+'"]').each(function(inp) {
            		    if (inp.checked) {
            		        valid = true;
            		    }
            		});
            	}
            	return valid;
            },

            select: function(elm) {
                if (elm.hasClassName('validate-not-first') && elm.selectedIndex == 0) {
                    return false;
                } else if (elm.hasClassName('validate-not-empty') && elm.options[elm.selectedIndex].value.length == 0) {
                    return false;
                }
                return true;
            }

        };

        JSV.Lang = {
            strings: {
                'error_message_start':    'We have found the following error(s):',
                'error_message_end':      'Please check the fields and try again.',
                'error_message_default':  'Some required values are not correct. Please check the fields and try again.<br>'
            },

            getString: function(string_code, params) {
                var orig_code = string_code;
                if (typeof(JSV.Lang.strings[string_code]) != 'undefined') {
                    return JSV.Lang.strings[string_code];
                } else {
                    return '(Unknown String: ' + (orig_code != string_code ? string_code + ' via ' : '') + orig_code + ')';
                }
            }
        };

        JSV.Init.add(JSV.Validate.init);

        Event.observe(window, 'load',   JSV.Init.run);
        Event.observe(window, 'unload', JSV.Init.runUnload);
    }
}
