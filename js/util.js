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

//utilities

String.prototype.chunk = function(n) {
    var ret = [];
    for (var i = 0, len = this.length; i < len; i += n) {
       ret.push(this.substr(i, n));
    }
    return ret;
};

//handle anchor tags
document.addEventListener('click', function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    
    while (target != this) {
        if (target.nodeName === 'A') {
    		var href = target.getAttribute('href');
    		//href should be a page ID, so nothing other than one hash and letters is allowed
    		if (href.match(/^#[a-zA-Z]{1}\w*$/) !== null) {
    			//now test if element with this ID is an .ui-page
    			var page = document.querySelector(href);
    			if (page.classList.contains('ui-page')) {
    				//now we can safely change page
    				showPage(page, target.dataset);
    				
            		e.preventDefault();
            		e.cancelBubble = true;
            		e.stopPropagation();
                	return false;
    			}
    			break;
    		}
    		break;
        }
        target = target.parentNode;
    }
    return;
    
}, false);

function showPage(page_id, ev) {
	var event = new CustomEvent('pageasd', { 'detail': ev });
	if (typeof page_id !== 'object') {
		page_id = page_id.replace(/#+/, '');
		page_id = document.querySelector('.ui-page#'+page_id);
	}
	if (page_id && typeof page_id === 'object' && page_id.dispatchEvent !== undefined) {
        if (page_id.dataset.script !== undefined) {
            //load script for this page
            var head = document.getElementsByTagName('head')[0],
                script = document.createElement('script');

            script.type = 'text/javascript';
            script.src = page_id.dataset.script;

            script.onreadystatechange = script.onload = function () {
                page_id.dispatchEvent(event);
            };
            
            head.appendChild(script);
        } else {
            page_id.dispatchEvent(event);   
        }
	}
}

function getReferenceUnit(cat) {
	var prev = 0;
	for (var i = 0; i < cat.systems.length; i++) {
		if (cat.ref >= cat.systems[i].units.length + prev) {
			prev += cat.systems[i].units.length;
		} else {
			return cat.systems[i].units[cat.ref - prev];
		}
	}
}

//src and dst should be objects
function calculateNonLinearUnit(cat, src, src_val, dst) {
	if (typeof src !== 'object' || typeof dst !== 'object') {
		return null;
	}
	if (cat.special === null || dst.special == src.special) {
		return src_val;
	}
	src_val = new Big(src_val);
	switch (+cat.special) {
	//temperature
	case 0:
		var kelv_val = new Big(0.0);
		if (src.special == 0) {
			//celsius
			kelv_val = src_val.plus(273.15);
		} else if (src.special == 1) {
			//fahrenheit
			//kelv_val = (((src_val - 32) * 5) / 9) + 273.15;
			kelv_val = src_val.minus(32).times(5).div(9).plus(273.15);
		} else if (src.special == 2) {
			//kelvin
			kelv_val = src_val;
		} else if (src.special == 3) {
			//reaumur
			//kelv_val = (src_val * 1.25) + 273.15;
			kelv_val = src_val.times(1.25).plus(273.15);
		} else if (src.special == 4) {
			//rankine
			//kelv_val = src_val / 1.8;
			kelv_val = src_val.div(1.8);
		} else {
			kelv_val = src_val;
		}

		var res_val = new Big(0.0);
		if (dst.special == 0) {
			//celsius
			//res_val = kelv_val - 273.15;
			res_val = kelv_val.minus(273.15);
		} else if (dst.special == 1) {
			//fahrenheit
			//res_val = (((kelv_val - 273.15) * 9) / 5) + 32;
			res_val = kelv_val.minus(273.15).times(9).div(5).plus(32);
		} else if (dst.special == 2) {
			//kelvin
			res_val = kelv_val;
		} else if (dst.special == 3) {
			//reaumur
			//res_val = (kelv_val - 273.15) * 0.8;
			res_val = kelv_val.minus(273.15).times(0.8);
		} else if (dst.special == 4) {
			//rankine
			//res_val = kelv_val * 1.8;
			res_val = kelv_val.times(1.8);
		} else {
			res_val = kelv_val;
		}
		
		if (!src_val.eq(0) && !res_val.round(5).eq(0)) {
			return res_val.round(5);
		} else {
			return res_val.round(10);
		}
		
	//fuel consumption
	case 1:
		//litres = 3.785412 * US gallons
		//litres = 4.546099 * UK gallons
		//km = 1.609344 * miles
		var litres_km_val = new Big(0.0);
		if (src.special == 0) {
			//litres per 100 km
			litres_km_val = src_val;
			
		} else if (src.special == 1) {
			//km per litre
			//litres_km_val = 100.0 / src_val;
			var a = new Big(100);
			litres_km_val = a.div(src_val);
			
		} else if (src.special == 2) {
			//miles per US gallon
			//litres_km_val = (3.785412 * 100.0) / (src_val * 1.609344);
			var a = new Big(378.5412);
			var b = new Big(1.609344);
			litres_km_val = a.div(src_val.times(b));
			
		} else if (src.special == 3) {
			//US gallons per 100 miles
			//litres_km_val = (src_val * 3.785412) / 1.609344;
			var a = new Big(3.785412);
			var b = new Big(1.609344);
			litres_km_val = src_val.times(a).div(b);
			
		} else if (src.special == 4) {
			//miles per UK gallon
			//litres_km_val = (4.546099 * 100.0) / (src_val * 1.609344);
			var a = new Big(454.6099);
			var b = new Big(1.609344);
			litres_km_val = a.div(src_val.times(b));
			
		} else if (src.special == 5) {
			//UK gallons per 100 miles
			//litres_km_val = (src_val * 4.546099) / 1.609344;
			var a = new Big(4.546099);
			var b = new Big(1.609344);
			litres_km_val = src_val.times(a).div(b);
			
		} else if (src.special == 6) {
			//litres per 100 miles
			//litres_km_val = src_val / 1.609344;
			var b = new Big(1.609344);
			litres_km_val = src_val.div(b);
		}

		var res_val = new Big(0.0);
		if (dst.special == 0) {
			//litres per 100 km
			res_val = litres_km_val;
		} else if (dst.special == 1) {
			//km per litre
			//res_val = 100.0 / litres_km_val;
			var a = new Big(100);
			res_val = a.div(litres_km_val);
			
		} else if (dst.special == 2) {
			//miles per US gallon
			//res_val = (3.785412 * 100.0) / (litres_km_val * 1.609344);
			var a = new Big(378.5412);
			var b = new Big(1.609344);
			res_val = a.div(litres_km_val.times(b));
			
		} else if (dst.special == 3) {
			//US gallons per 100 miles
			//res_val = (litres_km_val * 1.609344) / 3.785412;
			var a = new Big(3.785412);
			var b = new Big(1.609344);
			res_val = litres_km_val.times(b).div(a);
			
		} else if (dst.special == 4) {
			//miles per UK gallon
			//res_val = (4.546099 * 100.0) / (litres_km_val * 1.609344);
			var a = new Big(454.6099);
			var b = new Big(1.609344);
			res_val = a.div(litres_km_val.times(b));
			
		} else if (dst.special == 5) {
			//UK gallons per 100 miles
			//res_val = (litres_km_val * 1.609344) / 4.546099;
			var a = new Big(4.546099);
			var b = new Big(1.609344);
			res_val = litres_km_val.times(b).div(a);
			
		} else if (dst.special == 6) {
			//litres per 100 miles
			//res_val = litres_km_val * 1.609344;
			var b = new Big(1.609344);
			res_val = litres_km_val.times(b);
		}

		if (!src_val.eq(0) && !res_val.round(5).eq(0)) {
			return res_val.round(5);
		} else {
			return res_val.round(10);
		}

	//data transfer rate
	case 2:
		var ref = 0;
		if (src.special !== null && dst.special !== null) {
			var ref_unit = getReferenceUnit(cat);

			var a = new Big(src.ratio);
			var b = new Big(ref_unit.ratio);
			var c = src_val;
			var d = new Big(dst.ratio);
			
			ref = a.times(b).div(c);
			ref = b.times(d).div(ref);
			
		} else {
			
			var a = src_val;
			var b = new Big(src.ratio);
			var c = new Big(dst.ratio);
			
			ref = a.div(b);
			ref = c.div(ref);
		}	
		if (ref.gt(1) || (ref.lt(1) && ref.gt(0.999))) {
			return ref.round(0);	
		} else {
			if (!src_val.eq(0) && !ref.round(5).eq(0)) {
				return ref.round(5);
			} else {
				return ref.round(10);
			}
		}
		
	//computer storage
	case 6:
		var a = src_val;
		var b = new Big(src.ratio);
		var c = new Big(dst.ratio);
		
		var ref = a.div(b);
		ref = ref.times(c);
		
		if (ref.gt(1)) {
			return ref.round(0);	
		} else {
			if (!src_val.eq(0) && !ref.round(5).eq(0)) {
				return ref.round(5);
			} else {
				return ref.round(10);
			}
		}
		
	//acceleration
	case 3:
	//speed
	case 4:
	//distance and length
	case 5:
		if (src.special !== null && dst.special !== null) {
			var ref_unit = getReferenceUnit(cat);

			var a = new Big(src.ratio);
			var b = new Big(ref_unit.ratio);
			//var c = new Big(src_val);//src_val is already big_number
			var c = src_val;
			var d = new Big(dst.ratio);
			
			var ref = a.times(b).div(c);
			ref = b.times(d).div(ref);
			
			//var ref = ((src.ratio * ref_unit.ratio) * 1e+16) / (src_val * 1e+16);
			//ref = ((ref_unit.ratio * dst.ratio) * 1e+16) / ref;

			if (!src_val.eq(0) && !ref.round(5).eq(0)) {
				return ref.round(5);
			} else {
				return ref.round(10);
			}
			
		} else {
			
			//var a = new Big(src_val);
			var a = src_val;
			var b = new Big(src.ratio);
			var c = new Big(dst.ratio);
			
			var ref = a.div(b);
			ref = c.div(ref);
			
			if (!src_val.eq(0) && !ref.round(5).eq(0)) {
				return ref.round(5);
			} else {
				return ref.round(10);
			}
			
			//var ref = (src_val * 1e+16) / (src.ratio * 1e+16);
			//return (dst.ratio * 1e+16) / ref;
		}
	}
	return 0.0;
}

function initApplication(callback) {
	if (typeof LANG_CODE === 'undefined' || typeof LANG_STRINGS === 'undefined') {
	    var head = document.getElementsByTagName('head')[0],
	    	script = document.createElement('script');
	    
	    script.type = 'text/javascript';
	    script.src = 'locales/en/language.js';

	    script.onreadystatechange = callback;
	    script.onload = callback;

	    head.appendChild(script);
		
	} else {
		callback();
	}
}

function localize(str) {
	if (LANG_STRINGS && str in LANG_STRINGS) {
		return LANG_STRINGS[str];
	}
}

function localizeUI() {
	var localizable = document.querySelectorAll("[data-localize]");
    if (localizable) {
        for (var i = 0; i < localizable.length; i++) {
            var node = localizable[i],
                str = node.dataset.localize;

            if (str in LANG_STRINGS && node.childNodes) {
                for (var j = 0; j < node.childNodes.length; j++) {
                    var child = node.childNodes[j];
                    if (child.nodeType === 3) {
                        child.nodeValue = LANG_STRINGS[str];
                        break;
                    }
                }
            }
        }
    }
}

function parseConversionData(xml_text) {
	var result = null;

    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xml_text, 'text/xml');

    if (xmlDoc && xmlDoc.childNodes.length === 1) {
        var convertor = xmlDoc.childNodes[0];
        if (convertor.nodeName === 'units_conversion') {
        	result = [];

            var categories = convertor.childNodes;
            //all child nodes should be tested against node with index 1, since 0 is a text node (newline in source file)
            if (categories && categories.length > 0 && categories[1].nodeName === 'category') {
                for (var i = 0; i < categories.length; i++) {
                    var category = categories[i];
                    if (category.nodeType === 1) {
                        var cat_title = category.getAttribute(LANG_CODE || 'en'),
                            cat_ref = parseInt(category.getAttribute('ref')),
                            cat_icon = category.getAttribute('icon_path'),
                            cat_special = category.getAttribute('sp_id');

                        var cat_systems = [];
                        var systems = category.childNodes;
                        if (systems && systems.length > 0 && systems[1].nodeName === 'system') {
                            for (var j = 0; j < systems.length; j++) {
                                var system = systems[j];
                                if (system.nodeType === 1) {
                                    var sys_title = system.getAttribute(LANG_CODE || 'en');

                                    var sys_units = [];
                                    var units = system.childNodes;
                                    if (units && units.length > 0 && units[1].nodeName === 'unit') {
                                        for (var k = 0; k < units.length; k++) {
                                            var unit = units[k];
                                            if (unit.nodeType === 1) {
                                                var unit_title = unit.getAttribute(LANG_CODE || 'en'),
                                                    unit_ratio = parseFloat(unit.getAttribute('ratio')),
                                                    unit_special = unit.getAttribute('sp_id');

                                                unit = {
                                                    title: unit_title,
                                                    ratio: unit_ratio,
                                                    special: unit_special
                                                };
                                                sys_units.push(unit);
                                            }
                                        }

                                    }
                                    if (!sys_units.length) {
                                        throw new Exception('System "' + sys_title + '" has no units or wrong unit tag name');
                                    }

                                    system = {
                                        title: sys_title,
                                        units: sys_units
                                    };
                                    cat_systems.push(system);
                                }
                            }
                        }
                        if (!cat_systems.length) {
                            throw new Exception('Category "' + cat_title + '" has no systems or wrong system tag name');
                        }

                        category = {
                            title: cat_title,
                            ref: cat_ref,
                            special: cat_special,
                            icon: cat_icon,
                            systems: cat_systems
                        };
                        result.push(category);
                    }
                }

            }
            if (!result.length) {
                throw new Exception('No categories found or wrong category tag name');
            }

        } else {
            throw new Exception('Wrong root node');
        }
    } else {
        throw new Exception('Error occured parsing XML file');
    }

    return result;
}


