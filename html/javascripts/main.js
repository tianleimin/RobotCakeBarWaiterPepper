
var animation_service = undefined
var memory_service = undefined
var speech_service = undefined
var animated_speech_service = undefined
var survey_service = undefined

var timeoutId = undefined
var startTime = undefined

function fadeOut(el){
    el.style.opacity = 1;

    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = 'none';
            el.classList.add('is-hidden');

        } else {
        requestAnimationFrame(fade);
        }
    })();
}
function fadeIn(el, display){
    if (el.classList.contains('is-hidden')){
        el.classList.remove('is-hidden');
    }
    el.style.opacity = 0;
    el.style.display = display || "inline";

    (function fade() {
        var val = parseFloat(el.style.opacity);
        if (!((val += .1) > 1)) {
        el.style.opacity = val;
        requestAnimationFrame(fade);
        }
    })();
}
function daydiff(first, second) {
    return Math.round((first-second)/(1000*60*60*24));
}
function randomize() {
    var number = Math.random()
    var result = number < 0.3
    return result
}
function reportValidity(element, message) {
    message = message || 'There are unanswered questions'

    var popup = document.getElementById('invalid-popup')
    document.getElementById('invalid-message').innerHTML = message

    if (popup) {

    if (!timeoutId) {
        fadeIn(popup)
    } else {
        clearTimeout(timeoutId)
        timeoutId = undefined
    }

        timeoutId = setTimeout(function() {
            fadeOut(popup)
            timeoutId = undefined
        }, 2000)
    }
}
function validateFields(parent) {
    var children = parent.querySelectorAll('input, select')
    var unique_names = new Set();
    var child_names = []

    if (children.length == 0) {
        return true
    }
    for (idx = 0; idx < children.length; idx++) {
            unique_names.add(children[idx].name)
    }

    unique_names.forEach(function(name) {
        child_names.push(name);
    })

    return Array.from(child_names).every(function (child_name) {
        var inputs = document.querySelectorAll('*[name="' + child_name + '"]')
        var message = undefined
        var complete = false

        for (idx = 0; idx < inputs.length; idx++) {
            var input = inputs[idx]
            if (input.type == 'radio' || input.type == 'checkbox') {
                complete = complete || input.checked
            } else if (input.type == 'number') {
                if (input.value.length > 0 && (parseInt(input.value) > parseInt(input.max) || parseInt(input.value) < parseInt(input.min))) {
                    if (input.max.length == 0) {
                        message = 'Response must be greater than or equal to ' + input.min
                    } else if (input.min.length == 0) {
                        message = 'Response must be less than or equal to ' + input.max
                    } else {
                        message = 'Response must be between ' + input.min + ' and ' + input.max
                    }
                } else {
                    complete = input.value.length > 0
                }
            } else {
                complete = complete || input.value.length > 0
            }
        }
        if (!complete && inputs.length != 0) {
            reportValidity(parent, message)
        }
        return complete
    })
}
function toJSONString( form ) {
    var obj = {};

    Array.from(form.querySelectorAll( "input, select, textarea" )).forEach(function (element) {
        var name = element.name;
        var value = element.value;

        if (element.type == 'radio' || element.type == 'checkbox') {
            if (!element.checked) return
        } else {
            if (element.value.length == 0) return
        }


        objectMerge(obj, serializeInput(name, value));
    })

    return JSON.stringify( obj )
}
function serializeInput(key, value) {
    var regex = /\[[^\]]*]/g
    var groups = key.match(regex)

    if (groups) {
        groups.unshift('[' + key.substring(0, key.indexOf('[')) + ']')
    } else {
        groups = ['[' + key + ']']
    }
    for (i = groups.length; i > 0; i--) {
        var fieldName = groups[i-1].substr(1, groups[i-1].length-2)

        if (fieldName.length == 0) {
            value = [value]
        } else {
            tmp = value
            value = {}
            value[fieldName] = tmp
        }
    }

    return value
}
function objectMerge(obj1, obj2) {
    for (var property in obj2) {
        if (Array.isArray(obj2[property])) {
            if (!(property in obj1)) {
                obj1[property] = []
            }
            obj1[property] = obj1[property].concat(obj2[property])
        }
        else if (typeof(obj2[property] == 'object')) {
            if (property in obj1) {
                objectMerge(obj1[property], obj2[property])
            } else {
                obj1[property] = obj2[property]
            }
        }
    }
}
function animate(element) {
  if (!element.dataset.animation) {
    return
  }
  animation_service.run(element.dataset.animation)
}
function readCaption(element) {
    var caption = element.getElementsByTagName('h1')[0]

    if (caption && caption.dataset.ignore == undefined && caption) {
        if (caption.dataset.animation) {
            animate(caption)
        }
        return say(caption.innerText, caption.dataset.autoTransition != undefined, caption.dataset.animated)
    }
    return Promise.resolve(element.dataset.autoTransition != undefined)
}
function readFeedback(element) {
    var feedback = element.querySelectorAll('[data-feedback]')
    for (i = 0; i < feedback.length; i++) {
        var child = feedback[i]
        if (child.type != 'radio' && child.type != 'checkbox') {
            continue
        }
        if (child.checked) {
            if (child.dataset.animation) {
              animate(child)
            }
            return say(child.dataset.feedback)
        }
    }
    return Promise.resolve(true)
}
function say(text, transition, animated) {
    transition = transition || false
    animated = animated || false

    //service = animated != undefined ? animated_speech_service : speech_service
    service = animated_speech_service;

    if (!service) {
        console.info(text)
        
        return new Promise(function (resolve) {
          return setTimeout(function () {
            resolve(transition)
          }, 2000)
        })
    }
  
    if (animated && animated.length == 0) {
      service.say(text);
    } else if (animated && animated.length != 0) {
      service.say(text, { 
        bodyLanguageMode : animated
      })
    } else {
      service.say(text, { 
        bodyLanguageMode : 'contextual'
      })
    }

    if (!memory_service) {
        return Promise.resolve(transition)
    }

    return new Promise(function(resolve, reject) {
        memory_service.subscriber('ALTextToSpeech/TextDone').then(function (subscriber) {
            promise = subscriber.signal.connect(function (state) {
                if (state == 0) {
                    return
                }
                promise.then(function (signalId) {
                    subscriber.signal.disconnect(signalId).catch(function (err) {})
                })
                resolve(transition)
            })
        })
    })
}
function submitForm() {
  location.reload();
}

function recordData(valStr) {
	var rec = '"'+valStr.trim()+'"';
	if (memory_service) {
		memory_service.raiseEvent("writeData", rec);
	}
}

function recordResp(nameStr,isElement) {
	//sayText(nameStr);
	//sayText(nextPage);
    if(isElement == 'true'){
        var options = document.getElementsByName(nameStr);
        for (var i=0; options[i]; ++i){
            if(options[i].checked){
                recordData(options[i].value);
            }
        }
    } else {
        recordData(nameStr);
    }
    return;
}


function connected(session) {
    if (!session) {
        return
    }

    var promises = []

    promises.push(session.service('ALMemory').then(function(service) {
        memory_service = service

        Array.from(document.querySelectorAll('[data-transition-event]')).forEach(function (element) {
            if (!memory_service) {
                return
            }

            if (element.dataset.transitionEvent.length == 0) {
                return
            }

            memory_service.subscriber(element.dataset.transitionEvent).then(function (subscriber) {
                subscriber.signal.connect(function (state) {
                    if (!element.classList.contains('active')) {
                        return
                    }
                    var buttons = element.getElementsByClassName('btn-navigate');
                    buttons[0].click()
                });
            });
        })
        memory_service.subscriber('BackBumperPressed').then(function (subscriber) {
            var promise = subscriber.signal.connect(function (state) {
                promise.then(function (signalId) {
                    subscriber.signal.disconnect(signalId)
                })
                submitForm()
            });
        })
    }));

    promises.push(session.service('ALTextToSpeech')
      .then(function(service) {
          service.setParameter("speed", 80)
          speech_service = service
      }));

    promises.push(session.service('ALAnimatedSpeech')
      .then(function(service) {
          animated_speech_service = service
      }));

    promises.push(session.service('ALAnimationPlayer').then(function(service) {
      animation_service = service
    }))

    Promise.all([promises]).then(function () {
      setTimeout(function () {
        if (document.getElementsByClassName('active').length == 0) {
          document.getElementsByClassName('survey-box')[0].classList.add('active')
          document.getElementsByClassName('survey-box')[0].querySelector('button').disabled = false;
        }
        var boxes = document.getElementsByClassName('survey-box')
        if (boxes.length != 0) {
            readCaption(boxes[0])
        }
      }, 500);
    })
}
function disconnected() {
    console.log('Disconnected...')
}

Array.from(document.getElementsByClassName('btn-navigate')).forEach(function (element) {
    element.addEventListener("click", function() {
        var self = this

        if (self.dataset.delay) {
            // say(self.dataset.delay.split(':')[1])
            // return
        }

        var parent = self.closest('.survey-box')
        var next_element_id = undefined

        var transition_ids = self.dataset.next.split(';')

        for (var i = 0; i < transition_ids.length; i++) {
            var items = transition_ids[i].split('=')

            if (items.length == 0) {
                continue
            }
            if (items.length == 1) {
                next_element_id = items[0]
                break
            }

            var condition_ids = items[0] || undefined
            var transition_id = items[1] || undefined
            
            var result = condition_ids.split('&').every(function(condition_id) {
                if (condition_id.startsWith('call:')) {
                  var func = condition_id.substring(5);
                  return window[func](parent.parentNode)    
                }

                var depends = document.getElementById(condition_id)
                return depends == undefined || depends.checked
            })
            
            if (result) {
                next_element_id = transition_id
                break
            }            
        }

        var next_element = document.getElementById(next_element_id)

        if (next_element == undefined) {
            return
        }

        if (!startTime) {
            startTime = new Date();
        }

        parent.classList.remove('active')

        var feedback = parent.querySelectorAll('[data-feedback]')
        var promises = []

        if (feedback.length) {
            promises.push(readFeedback(parent))
        }

        Promise.all(promises).then(function(results) {
            if (!self.classList.contains('previous') && !validateFields(parent)) {
                parent.classList.add('active')
                return
            }

            var promise = new Promise(function(resolve, reject) {
                if (!self.classList.contains('previous')) {
                  if (next_element.dataset.dialogShow != undefined) {
                    next_element.classList.add('active');
                  }
                  
                  readCaption(next_element).then(function(transition) {
                    Array.from(next_element.querySelectorAll('button:disabled')).forEach(function (elem) {
                      if (elem.classList.contains('ignore')) {
                        return;
                      }
                      elem.disabled = false;
                    })
                    if (next_element.classList.contains('survey-submit')) {
                        submitForm(next_element)
                    } else {
                        next_element.classList.add('active')
                        Array.from(next_element.querySelectorAll('[data-delay]')).forEach(function (child) {
                            child.dispatchEvent(new Event('displayed'))
                        })
                    }
                    
                    if (transition) {
                        var buttons = next_element.getElementsByClassName('btn-navigate')
                        buttons[0].click()
                    }
                    resolve()
                  })
                } else {
                    next_element.classList.add('active')
                    Array.from(next_element.querySelectorAll('[data-delay]')).forEach(function (child) {
                        child.dispatchEvent(new Event('displayed'))
                    })
                    resolve()
                }
            })

            Promise.all([promise]).then(function() {
                if (next_element.dataset.triggerEvent && memory_service) {
                    memory_service.raiseEvent(next_element.dataset.triggerEvent, 1)
                }

                var children = next_element.querySelectorAll('[data-display-on]')
                for (i = 0; i < children.length; i++) {
                    var child = children[i]
                    if (child.dataset.displayOn.startsWith('call:')) {
                        if ((window[child.dataset.displayOn.substring(5)])()) {
                            child.style.display = 'block'
                        }
                    } else {
                        var depends = document.getElementById(child.dataset.displayOn)
                        if (depends == undefined || depends.checked) {
                            child.style.display = 'block'
                        }
                    }
                }
                if (!memory_service && next_element.dataset.transitionEvent) {
                    var buttons = next_element.getElementsByClassName('btn-navigate')
                    buttons[0].click()
                }

                if (next_element.dataset.duration) {
                    setTimeout(function() {
                        var buttons = next_element.getElementsByClassName('btn-navigate')
                        buttons[0].click()
                    }, parseInt(next_element.dataset.duration) * 1000)
                }

                var boxes = document.getElementsByClassName('survey-box')
                var percent = ((Array.from(boxes).indexOf(next_element) + 1) / boxes.length) * 100

                document.getElementById('progress-bar').style.width = percent + 'vw'
            })
        })
    })
})

Array.from(document.getElementsByClassName('btn-reset')).forEach(function (element) {
    element.addEventListener("click", function() {
        location.reload();
    })
})

Array.from(document.getElementsByClassName('btn-submit')).forEach(function (element) {
    element.addEventListener("click", function() {
        this.onclick = function() {
            return true
        }
        submitForm(this.closest('.survey-box'))
    })
})

Array.from(document.getElementsByTagName('form')).forEach(function (element) {
    element.addEventListener("keypress", function(evt) {
        if (evt.keyCode == 13) {
            return evt.preventDefault();
        }
        return true
    })
})

Array.from(document.querySelectorAll('[data-replace]')).forEach(function(element) {
    element.addEventListener("click", function() {
        for (replacement of this.dataset.replace.split(';')) {
            replacement = replacement.split(':')
            Array.from(document.getElementsByClassName(replacement[0])).forEach(function (child) {
                child.innerHTML = replacement[1]
            })
        }
    })
})

Array.from(document.querySelectorAll('[data-delay]')).forEach(function(element) {
    // element.addEventListener('displayed', function() {
    //     var self = this
    //     setTimeout(function() {
    //         self.removeAttribute('data-delay')
    //     }, parseInt(this.dataset.delay.split(':')) * 1000)
    // })
})

Array.from(document.querySelectorAll('[data-click-color]')).forEach(function(element) {
  element.addEventListener("click", function() {
    var parent = this.closest('table');
    console.log(parent)
    Array.from(parent.querySelectorAll('.colored')).forEach(function (child) {
      child.classList.remove('colored');
    })
    Array.from(parent.querySelectorAll('.colored-inverted')).forEach(function (child) {
      child.classList.remove('colored-inverted');
    })
    var inverted = this.dataset.clickColor == 'inverted'
    this.classList.add('colored' + (inverted? '-inverted' : ''));

    var box = document.getElementById('emotion-box');
    if (box) {
      box.textContent = this.textContent;
      box.style.background = this.style.background;
      box.className = this.className
    }
    Array.from(document.querySelectorAll('.ignore')).forEach(function (child) {
      child.disabled = false;
    })
  })
})

Array.from(document.querySelectorAll('[type="range"][data-target]')).forEach(function(element) {
  element.addEventListener("input", function() {
    console.log(this.value)
    var target = document.getElementById(this.dataset.target);
    var children = target.children;
    var width = target.clientWidth;
    var height = target.clientHeight;

    for (var i = 0; i < children.length; i += 1) {
      var child = children[i];
      var offset = 0;

      if (this.dataset.axis === "horizontal") {
        offset = (child.offsetLeft) / width * 100;
      } else {
        offset = (height - child.offsetTop - child.clientHeight) / height * 100;
      }

      if (offset > this.value) {
        child.classList.add('faded');
      } else {
        child.classList.remove('faded');
      }
    }
  })
})

Array.from(document.querySelectorAll('[data-replace-inline]')).forEach(function(element) {
  element.addEventListener("change", function() {
    var target = document.getElementById(this.dataset.replaceInline);
    target.textContent = this.value;
  })
});

Array.from(document.querySelectorAll('button')).forEach(function (element) {
  element.disabled = true;
});

try {
    QiSession(function(session) {
        connected(session)
    }, disconnected)
} catch (err) {
    var boxes = document.getElementsByClassName('survey-box')
    if (boxes.length != 0) {
        readCaption(boxes[0])
    }
    console.info('localhost only...')
    document.getElementsByClassName('survey-box')[0].querySelector('button').disabled = false;
}