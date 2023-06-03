module.exports = function(RED) {
    var ui = undefined;
    var findStyle = function (value, config) {
        let style = undefined;
        /*style = {
            icon: "",
            iconColor: "",
            iconShadow: "",
            textColor: "",
            textShadow: "",
            bgColor: ""
        };*/
        try {
            if (config.options.length > 0) {
                config.options.forEach( function(item) {
                    if (item.value.toLowerCase() == value.toString().toLowerCase() && item.valueType.substring(0,3) == (typeof value).substring(0, 3)) {
                        let fIconColor = item.iconColor;
                        let fTextColor = item.textColor;
                        let fBgColor = item.bgColor;
                        let fIconShadow = "unset";
                        let fTextShadow = "unset";
                        if (fIconColor == "") { fIconColor = "var(--nr-dashboard-widgetTextColor)"; }
                        if (fTextColor == "") { fTextColor = "var(--nr-dashboard-widgetTextColor)"; }
                        if (fBgColor == "") { fBgColor = "var(--nr-dashboard-widgetColor)"; }
                        
                        if (item.iconShadow == true) {
                            fIconShadow = String.raw`
                                0px 0px 5px ${fBgColor}, 
                                0px 0px 10px ${fIconColor},
                                0px 0px 15px ${fIconColor},
                                0px 0px 20px ${fIconColor},
                                0px 0px 30px ${fIconColor},
                                0px 0px 40px ${fIconColor},
                                0px 0px 55px ${fIconColor},
                                0px 0px 75px ${fIconColor}`;
                        }

                        if (item.textShadow == true) {
                            fTextShadow = String.raw`
                                0px 0px 5px ${fBgColor}, 
                                0px 0px 10px ${fTextColor},
                                0px 0px 15px ${fTextColor},
                                0px 0px 20px ${fTextColor},
                                0px 0px 30px ${fTextColor},
                                0px 0px 40px ${fTextColor},
                                0px 0px 55px ${fTextColor},
                                0px 0px 75px ${fTextColor}`;
                        }
                        
                        style = {
                            icon: item.icon,
                            iconColor: item.iconColor,
                            iconShadow: fIconShadow,
                            textColor: item.textColor,
                            textShadow: fTextShadow,
                            bgColor: item.bgColor
                        };
                        
                    } 
                });
            }
            
        }
        catch (e) {
            
        }
        return style;
    }

    var generateHTML = function (node, config) {
        
        var id = node.id.replace(/[^\w]/g, "");
        var HTML = "";
        /**/
        var icons = "";
        //let defaultStyle = findStyle("default", config);
        let defaultStyle = findStyle("default", config);
        icons += String.raw`<ui-icon icon="{{msg.style.icon || '${defaultStyle.icon}'}}" style="color: {{msg.style.iconColor || '${defaultStyle.iconColor}'}}; text-shadow: {{msg.style.iconShadow || '${defaultStyle.iconShadow}'}};"></ui-icon>`;
        HTML += String.raw`<md-button class="md-raised" ng-click="buttonClicked($event)" id="btn_${id}" style="background-color:{{msg.style.bgColor || '${defaultStyle.bgColor}'}};">`;
        HTML += icons;
        HTML += String.raw`
        <span style="color: {{msg.style.textColor || '${defaultStyle.textColor}'}}; text-shadow: {{msg.style.textShadow || '${defaultStyle.textShadow}'}};">${config.label}</span>
        </md-button>`;
        
        HTML += String.raw`<input type="hidden" ng-init="init('` + config.class + `')">`;
        return HTML;
    }
    
    function MS_Button(config) {
        try {
            node = this;
            //node.defaultStyleValue = context.globe_defaultStyleValue.getValue();
            node.defaultStyleValue = "default";
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }

            RED.nodes.createNode(this,config);
            
            node.on('input', function(msg) {
                //set payload
                if (config.sendValueType == "msg") {
                    node.newMsg_payload = RED.util.getMessageProperty(msg, config.sendValue);
                }else if (config.sendValueType == "str") {
                    node.newMsg_payload = RED.util.getMessageProperty(msg, config.payload);
                }

                if (config.topicType == "msg") {
                    node.newMsg_topic = RED.util.getMessageProperty(msg, config.topic);
                }

                //set Style
                let payload = RED.util.getMessageProperty(msg, config.payload);
                                
                let style = findStyle(payload, config);
                if(style != undefined) {
                    node.style = style;
                }
                if (node.style != undefined) {
                    msg.style = node.style;
                }
                
            });

            var done = ui.addWidget({
                node: node,
                format: generateHTML(node, config),
                templateScope: "local",
                group: config.group,
                emitOnlyNewValues: false,
                forwardInputMessages: false,
                storeFrontEndInputAsState: true,
                group: config.group,
                order: config.order,
                width: config.width,
                height: config.height,
                
                convertBack: function (value) {
                    return value;
                },

                beforeSend: function (msg, orig) {
                    //set topic
                    let t;
                    if (config.topicType == "msg") { 
                        t = node.newMsg_topic; 
                    } else if (config.topicType == "str") {
                        t = config.topic;
                    }
                    msg.topic = t;

                    //set payload
                    let pl;
                    if (config.sendValueType == "str") {
                        if (config.sendValue == "toggle on off") {
                            if (node.newMsg_payload == "ON") {
                                pl = "OFF";
                            } else if (node.newMsg_payload == "On") {
                                pl = "Off";
                            } else if (node.newMsg_payload == "on") {
                                pl = "off";
                            } else if (node.newMsg_payload == "OFF") {
                                pl = "ON";
                            } else if (node.newMsg_payload == "Off") {
                                pl = "On";
                            } else {
                                pl = "on";
                            }
                        } else if (config.sendValue == "toggle true false") {
                            if (node.newMsg_payload == true) {
                                pl = false;
                            } else {
                                pl = true;
                            }
                        } else {
                            pl = config.sendValue;    
                        }
                    } else if (config.sendValueType == "num") {
                        pl = parseFloat(config.sendValue);
                    } else if (config.sendValueType == "bool") {
                        pl = Boolean(config.sendValue);
                    } else if (config.sendValueType == "msg") {
                        pl = node.newMsg_payload;
                    }
                    delete msg[config.sendValueTo.split(".")[0]];
                    RED.util.setMessageProperty(msg, config.sendValueTo, pl, true);
                                   
                    if (orig){
                        msg.event = orig.msg.event  
                    }      
                },

                initController: function ($scope, events) {
                    setTimeout(function () {
                        $scope.button = document.querySelector("#btn_" + id);
                        $scope.button.parentElement.classList.add("nr-dashboard-button");
                        $scope.button.parentElement.classList.remove("nr-dashboard-template");
                        if ($scope.classNames != "")
                        {
                            $scope.classNames.split(" ").forEach( function(item) { $scope.button.parentElement.classList.add(item); } )
                        }
                        
                    }, 300);

                    $scope.init = function (classNames) {
                        $scope.classNames = classNames;
                    }

                    $scope.buttonClicked = function (event) {
                        //$scope.send($scope.msg);
                        $scope.send({event: $scope.getPosition(event)});                   
                                               
                    }

                   $scope.getPosition = function (event) {
                        let bb0 = $scope.button.parentElement.getBoundingClientRect().left;
                        let bb3 = $scope.button.parentElement.getBoundingClientRect().top;
                        let bb1 = bb3 + $scope.button.parentElement.offsetHeight;
                        let bb2 = bb0 + $scope.button.parentElement.offsetWidth;
                        let x = event.clientX;
                        let y = event.clientY;
                        return { clientX: x, clientY: y, bbox: [bb0, bb1, bb2, bb3] };
                    }

                    $scope.$watch("msg", function (msg) {
                        if (!msg) { return; };
                    });
                },
                
                beforeEmit: function (msg, value) {
                    return { msg };
                
            }

            });
        }
        catch (e) {
            console.log(e);
        }
        node.on("close", done);
    }
    RED.nodes.registerType("ui_multistyle-button",MS_Button);
}