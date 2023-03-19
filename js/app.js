/*
* Copyright (c) 2016 Evgenii Dobrovidov
* This file is part of "Unit Converter".
*
* "Unit Converter" is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* "Unit Converter" is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with "Unit Converter".  If not, see <http://www.gnu.org/licenses/>.
*/

//conversion data format:
//[{ title: '', ref: '', special: '', icon: '', systems: [{title: '', units: [{title: '', ratio: '', special: ''}, ..]}, ..]}, ..]
var CONVERSION_DATA = null;

/*+STATE+*/
var pages = {
	main: {
		page: document.querySelector("#main"),
		content: document.querySelector("#main .ui-content"),
		sections_list: document.querySelector("#main .ui-content > .section-changer")
	},
	category: {
		page: document.querySelector("#category"),
		content: document.querySelector("#category .ui-content"),
		units_list: document.querySelector("#category .ui-content > .ui-listview") 
	},
	input: {
		page: document.querySelector("#input"),
		content: document.querySelector("#input .ui-content"),
		digits_display: document.querySelector("#input .ui-content > .digits > span"),
		digits_display_container: document.querySelector("#input .ui-content > .digits"),
		buttons: {
			plus_minus: document.querySelector("#input .ui-content > .keys #plus_minus_button"),
			dot: document.querySelector("#input .ui-content > .keys #dot_button"),
			erase: document.querySelector("#input .ui-content > .keys #erase_button"),
			ok: document.querySelector("#input .ui-content > .keys #ok_button"),
			cancel: document.querySelector("#input .ui-content > .keys #cancel_button")
		},
		digit_keys: document.querySelectorAll("#input .ui-content > .keys .digit-button")
	}
};
var ui_objects = {
	main_page_section_list: null
};
var settings = {
	screen_resolution: [320, 320]	
};
var state = {
	current_category: null,
	current_input_system: null,
	current_input_unit: null,
	current_input_value: null
};
var input_state = {
	plus: true,
	dot_placed: false,
	number_string: "0",
	input_unit: null,
	input_system: null
};
/*-STATE-*/

function initMainPage() {
	//main page has to be built manually (not in event) because event may get triggered before CONVERSION_DATA is loaded
	if (settings.screen_resolution[0] > 320 && settings.screen_resolution[1] > 320) {
		for (var i = 0; i < CONVERSION_DATA.length; i += 4) {
			var section = document.createElement('section');
			if (i === 0) {
				section.setAttribute('class', 'ui-section-active no-flex');
			} else {
				section.setAttribute('class', 'no-flex');	
			}
			
			for (var j = i; j < i + 4 && j < CONVERSION_DATA.length; j++) {
				var cat = CONVERSION_DATA[j];
				
				var grid_item = document.createElement('div');
				grid_item.setAttribute('class', 'grid-item');
				grid_item.innerHTML = '<a href="#category" data-category="'+j+'"><img src="res/category_icons/'+cat.icon+'"><span>'+cat.title+'</span></a>';
				section.appendChild(grid_item);				
			}
			
			pages.main.sections_list.appendChild(section);
		}
		
	} else {
		for (var i = 0; i < CONVERSION_DATA.length; i++) {
			var cat = CONVERSION_DATA[i];
			
			var section = document.createElement('section');
			if (i === 0) {
				section.setAttribute('class', 'ui-section-active');
			}
			section.innerHTML = '<a href="#category" data-category="'+i+'"><img src="res/category_icons/'+cat.icon+'"><span>'+cat.title+'</span></a>';	
			pages.main.sections_list.appendChild(section);
		}
	}

	ui_objects.main_page_section_list = new tau.widget.SectionChanger(pages.main.content, {
		circular: true,
		orientation: "horizontal",
		scrollbar: "tab"
	});
}

function initCategoryPage(e) {
	state.current_category = e.detail.category;
	state.current_input_value = null;
}

function showCategoryPage(e) {
	if (CONVERSION_DATA && CONVERSION_DATA.length > 0) {
		if (state.current_category >= 0) {
			//we need to clear the whole list before filling it again
			while (pages.category.units_list.firstChild) {
				pages.category.units_list.removeChild(pages.category.units_list.firstChild);
			}
			if (state.current_input_value === null || (state.current_input_value == 0 && CONVERSION_DATA[state.current_category].special != '0')) {
				pages.category.units_list.classList.add('init');
			} else {
				pages.category.units_list.classList.remove('init');
			}
			window.scrollTo(0, 0);
			for (var i = 0; i < CONVERSION_DATA[state.current_category].systems.length; i++) {
				var system = CONVERSION_DATA[state.current_category].systems[i];
				
				var system_item = document.createElement('li');
				system_item.setAttribute('class', 'system-name');
				system_item.innerHTML = system.title;
				pages.category.units_list.appendChild(system_item);
				
				for (var j = 0; j < system.units.length; j++) {
					var unit = system.units[j];
					
					var unit_item = document.createElement('li');
					unit_item.classList.add('unit');
					unit_item.setAttribute('id', 'unit_' + state.current_category + '_' + i + '_' + j);
					
					var value_text = '';
					if (state.current_input_value !== null && (state.current_input_value != 0 || CONVERSION_DATA[state.current_category].special == '0')) {
						//now the real things start to happen - calculation
						if (state.current_input_unit == j && state.current_input_system == i) {
							value_text = state.current_input_value.toString();							
							unit_item.classList.add('current');
							
						} else {
							var cur_unit = CONVERSION_DATA[state.current_category].systems[state.current_input_system].units[state.current_input_unit];
							if (unit.special == null && cur_unit.special == null) {
								
								var a = new Big(state.current_input_value);
								var b = new Big(cur_unit.ratio);
								
								var ref = a.div(b);
								value_text = ref.times(unit.ratio);
								
								if (CONVERSION_DATA[state.current_category].special == '2') {
									if (value_text.gt(1) || (value_text.lt(1) && value_text.gt(0.999))) {
										value_text = value_text.round(0).toString();	
									} else {
										if (!a.eq(0) && !value_text.round(5).eq(0)) {
											value_text = value_text.round(5).toString();
										} else {
											value_text = value_text.round(10).toString();
										}
									}
								} else {
									if (state.current_input_value != 0 && !value_text.round(5).eq(0)) {
										value_text = ref.times(unit.ratio).round(5).toString();
									} else {
										value_text = ref.times(unit.ratio).round(10).toString();
									}									
								}
								
							} else {
								//special calculation
								var ref = calculateNonLinearUnit(CONVERSION_DATA[state.current_category], cur_unit, state.current_input_value, unit);
								//ref is supposed to be Big here
								value_text = ref.toString();
							}
						}
						var exp = value_text.match(/(e[+-]\d+)/);
						value_text = value_text.replace(/e[+-]\d+/, '');
						
						value_text = value_text.chunk(1).join("&#8203;");
						if (exp !== null) {
							value_text += "&#8203;" + exp[1];	
						}
						//value_data = ' data-input-value="' + value_text + '"';
					}
					unit_item.innerHTML = '<a href="#input" data-system="' + i + '" data-unit="' + j + '"><div class="unit-name">' + unit.title + '</div><div class="current-value">' + value_text + '</div></a>';
					pages.category.units_list.appendChild(unit_item);
				}
			}
		}
	}
}

function initInputPage(e) {
	//state.current_input_system = e.detail.system;
	//state.current_input_unit = e.detail.unit;
	input_state = {
		plus: true,
		dot_placed: false,
		number_string: "0",
		input_unit: e.detail.unit,
		input_system: e.detail.system
	};
}

function showInputPage(e) {
	if (!state.current_category || !input_state.input_system || !input_state.input_unit) {
		alert(localize('input_wrong_data'));
		tau.back();
		
	} else {
		pages.input.digits_display.innerText = "0";
	}
}

function fitText(element) {
    var e = element.parentNode,
    	maxWidth = e.offsetWidth - 10,
    	maxHeight = e.offsetHeight - 6,
    	sizeX = element.offsetWidth,
    	sizeY = element.offsetHeight,
    	fontSize = parseInt(document.defaultView.getComputedStyle(element, null).fontSize, 10);
    
    if (sizeY <= maxHeight && sizeX <= maxWidth) {
    	return null;
    }

    element.style.fontSize = '';
    while ((sizeX > maxWidth || sizeY > maxHeight) && fontSize > 4) {
        fontSize -= 1;
        element.style.fontSize = fontSize + "px";
        sizeX = element.offsetWidth;
        sizeY = element.offsetHeight;
    }
    return element;
}

function bindPageEvents() {
	pages.category.page.addEventListener("pageasd", initCategoryPage);
	pages.category.page.addEventListener("pagebeforeshow", showCategoryPage);
	
	pages.input.page.addEventListener("pageasd", initInputPage);
	pages.input.page.addEventListener("pagebeforeshow", showInputPage);
	
	//assign events for buttons
	for (var i = 0; i < pages.input.digit_keys.length; i++) {
		var digit_key = pages.input.digit_keys[i];
		digit_key.addEventListener("click", function () {
			var digit = this.dataset.digit;
			var str_length = input_state.number_string.length;
			if (input_state.dot_placed) {
				str_length--;
			}
			if (!input_state.plus) {
				str_length--;
			}
			if (str_length < 15) {
				if ((+input_state.number_string) == 0) {
					if ((+digit) > 0) {
						if (input_state.dot_placed) {
							input_state.number_string += digit;
						} else {
							input_state.number_string = digit;
						}
					} else if (input_state.dot_placed) {
						input_state.number_string += digit;	
					} else {
						input_state.number_string = digit;
					}
				} else {
					input_state.number_string += digit;
				}
				
			} else {
				//add error class (max length)
				pages.input.digits_display_container.classList.add('error');
			}
			pages.input.digits_display.innerText = input_state.number_string;
			fitText(pages.input.digits_display);
		});
	}
	
	pages.input.buttons.plus_minus.addEventListener("click", function () {
		if ((+input_state.number_string) != 0) {
			if (input_state.plus) {
				input_state.plus = false;
				input_state.number_string = '-' + input_state.number_string;
			} else {
				input_state.plus = true;
				input_state.number_string = input_state.number_string.slice(1);	
			}
		}
		pages.input.digits_display_container.classList.remove('error');
		pages.input.digits_display.innerText = input_state.number_string;
		fitText(pages.input.digits_display);
	});
	
	pages.input.buttons.dot.addEventListener("click", function () {
		if (!input_state.dot_placed) {
			var str_length = input_state.number_string.length;
			if (!input_state.plus) {
				str_length--;
			}
			if (str_length < 15) {
				input_state.number_string += '.';
				input_state.dot_placed = true;
				
				pages.input.digits_display_container.classList.remove('error');
				pages.input.digits_display.innerText = input_state.number_string;
				fitText(pages.input.digits_display);				
			}
		}
	});
	
	pages.input.buttons.erase.addEventListener("click", function () {
		var length = input_state.number_string.length;
		if (!input_state.plus) {
			length = input_state.number_string.length - 1;
		}
		if (length > 1) {
			if (input_state.number_string.substr(input_state.number_string.length - 1) == '.') {
				input_state.dot_placed = false;
			}
			input_state.number_string = input_state.number_string.slice(0, -1);	
		} else {
			input_state.number_string = "0";
			input_state.plus = true;
			input_state.dot_placed = false;
		}
		pages.input.digits_display_container.classList.remove('error');
		pages.input.digits_display.innerText = input_state.number_string;
		fitText(pages.input.digits_display);
	});
	pages.input.buttons.ok.addEventListener("click", function () {
		pages.input.digits_display_container.classList.remove('error');
		pages.input.digits_display.style.fontSize = '';
		
		state.current_input_system = input_state.input_system;
		state.current_input_unit = input_state.input_unit;
		
		state.current_input_value = +input_state.number_string;
		tau.back();
	});
	pages.input.buttons.cancel.addEventListener("click", function () {
		pages.input.digits_display_container.classList.remove('error');
		pages.input.digits_display.style.fontSize = '';
		
		tau.back();
	});
}

(function() {
	initApplication(function () {
	    //application entry point
	    window.addEventListener('tizenhwkey', function(ev) {
	        if (ev.keyName == "back") {
	            var page = document.getElementsByClassName('ui-page-active')[0],
	                pageid = page ? page.id : "";
	            if (pageid === "main") {
	                try {
	                    tizen.application.getCurrentApplication().exit();
	                } catch (ignore) {}
	            } else {
	                tau.back();
	            }
	        }
	    });

	    //setup some options
	    tau.defaults.pageTransition = "slideup";
	    
	    //unfortunately screen resolution matters a lot in this app, so we have to make sure we acquired it before moving further
	    //javascript asynchronous everything is really a pain in the arse
	    tizen.systeminfo.getPropertyValue("DISPLAY", function (screen) {
			var width = screen.resolutionWidth,
				height = screen.resolutionHeight;
			
			settings.screen_resolution = [width, height];
			
			if (height > 320) {
				pages.input.digits_display.classList.add('tall');
			}
			
			//ok, now we are ready!
		    localizeUI();

		    //now load conversion data
		    tizen.filesystem.resolve(
		        'wgt-package',
		        function(dir) {
			        var data = dir.resolve('res/conv_data.xml');
			        if (data) {
			            data.readAsText(function(text) {           	
			                try {
			                	CONVERSION_DATA = parseConversionData(text);
			                	//now that we have everything for application functioning we can start building UI
			                	initMainPage();
			                	
			                	//and bind event handlers for pages
			                	bindPageEvents();
	
			                } catch (e) {
			                    console.log(e);
			                    console.log("Error: " + e.message);
			                    alert(localize('load_conv_error'));
			                    try {
			                        tizen.application.getCurrentApplication().exit();
			                    } catch (ignore) {}
			                }
			                
			            }, function(e) {
			            	console.log(e);
			                console.log("Error: " + e.message);
			                alert(localize('load_conv_error'));
			                try {
			                    tizen.application.getCurrentApplication().exit();
			                } catch (ignore) {}
			            });
			        }
			    }, function(e) {
			    	console.log(e);
			        console.log("Error: " + e.message);
			        alert(localize('load_conv_error'));
			        try {
			            tizen.application.getCurrentApplication().exit();
			        } catch (ignore) {}
			    }, "r"
		    );
		});
	});
}());