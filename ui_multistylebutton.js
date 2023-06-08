module.exports = function(RED) {
    var ui = undefined;
    
    var generateHTML = function (node, config) {
        var setstyle = function (styleset) {
            let iconColor = styleset.iconColor;
            let textColor = styleset.textColor;
            let bgColor = styleset.bgColor;
            let iconShadow = "unset";
            let textShadow = "unset";
            if (iconColor == "") { iconColor = "var(--nr-dashboard-widgetTextColor)"; }
            if (textColor == "") { textColor = "var(--nr-dashboard-widgetTextColor)"; } 
            if (bgColor == "") { bgColor = "var(--nr-dashboard-widgetColor)"; }
            if (styleset.iconShadow == true ) { iconShadow = String.raw`0px 0px 5px ${bgColor}, 0px 0px 10px ${iconColor}, 0px 0px 15px ${iconColor}, 0px 0px 20px ${iconColor}, 0px 0px 30px ${iconColor}, 0px 0px 40px ${iconColor}, 0px 0px 55px ${iconColor}, 0px 0px 75px ${iconColor}`; }
            if (styleset.textShadow == true ) { textShadow = String.raw`0px 0px 5px ${bgColor}, 0px 0px 10px ${textColor}, 0px 0px 15px ${textColor}, 0px 0px 20px ${textColor}, 0px 0px 30px ${textColor}, 0px 0px 40px ${textColor}, 0px 0px 55px ${textColor}, 0px 0px 75px ${textColor}`; }
            return {iconColor: iconColor, textColor: textColor, bgColor: bgColor, iconShadow: iconShadow, textShadow: textShadow};
        }

        var id = node.id.replace(/[^\w]/g, "");
        var HTML = "";
        var icon = "";
        config.options.forEach(function(item) {
            let style = setstyle(item);
            let value = item.value;
            if (config.ignoreCases == true) { value = item.value.toLowerCase(); }
            icon += String.raw`
                <style ng-switch-when="${value}">#btn_${id} {background-color: ${style.bgColor};}</style>
                <ui-icon ng-switch-when="${value}" icon="${item.icon}" style="color: ${style.iconColor}; text-shadow: ${style.iconShadow}"></ui-icon>
                <span ng-switch-when="${value}" style="color: ${style.textColor}; text-shadow: ${style.textShadow}">${config.label}</span>`;
        });
        let defaultStyle = setstyle({iconColor: config.defaultIconColor, textColor: config.defaultTextColor, bgColor: config.defaultBgColor, iconShadow: config.defaultIconShadow, textShadow: config.defaultTextShadow});
        icon += String.raw`
                <style ng-switch-default>#btn_${id} {background-color: ${defaultStyle.bgColor};}</style>
                <ui-icon ng-switch-default icon="${config.defaultIcon}" style="color: ${defaultStyle.iconColor}; text-shadow: ${defaultStyle.iconShadow}"></ui-icon>
                <span ng-switch-default style="color: ${defaultStyle.textColor}; text-shadow: ${defaultStyle.textShadow};">${config.label}</span>
                <span style="color: ${config.sndLabelColor}; position: absolute; ${config.sndLabelPos}; line-height: 0px !important; font-size: ${config.sndLabelSize}">${config.sndLabel}</span>`;
        

        HTML += String.raw`
            <md-button class="md-raised" ng-switch="msg.${config.payload}" ng-click="buttonClicked($event)" id="btn_${id}">
                ${icon}
            </md-button>
            <input type="hidden" ng-init="init('` + config.class + `')">`;
        return HTML;
    }
    
    function MS_Button(config) {
        try {
            RED.nodes.createNode(this,config);
            var node = this;
            var data = new Map();
            
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            
            node.on('input', function(msg) {
                let matchingValue = RED.util.getMessageProperty(msg, config.payload).toString();

                //if ignoreCases do
                if (config.ignoreCases == true ) { matchingValue = matchingValue.toString().toLowerCase(); }
                //RED.util.setMessageProperty(msg, config.payload, matchingValue, true);

                //if last msg should repeated on noMatch do
                if (config.noMatchDefault != true) {
                    //chek Payload is in Options
                    config.options.forEach(function(item) {
                        if (item.value == matchingValue) { 
                            //data.set("valueExists", true);
                            data.set("oldPayload", JSON.stringify(RED.util.cloneMessage(msg))); 
                        }
                    });
                    //Object.keys(msg).forEach(key => delete msg[key]);
                    if (data.get("oldPayload") != undefined) {
                        Object.keys(msg).forEach(key => delete msg[key]);
                        msg = RED.util.cloneMessage(JSON.parse(data.get("oldPayload")));
                        //RED.util.setMessageProperty(msg, config.payload, data.get("oldPayload"), true);
                        //msg = JSON.parse(data.get("oldMsg"));
                    }
                }

                //copy manipulated message to emit to the ui button
                data.set("emitMsg", JSON.stringify(msg));

                //set payload
                node.sendValue = undefined;
                if (config.sendValueType == "msg") { node.sendValue = RED.util.getMessageProperty(msg, config.sendValue); }
                node.payload = undefined;
                node.payload = RED.util.getMessageProperty(msg, config.payload);
                
                //set topic
                if (config.topicType == "msg") {
                    node.topic = RED.util.getMessageProperty(msg, config.topic);
                }
                //node.send({payload: msg.payload});
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
                    if(orig) {
                        //manipulate topic
                        switch (config.topicType) {
                            case "msg":
                                orig.msg.topic = node.topic;
                                break;
                            case "str":
                                orig.msg.topic = config.topic;
                                break;
                        }
                        
                        //set payload
                        let payload;
                        switch (config.sendValueType) {
                            case "str":
                                switch (config.sendValue) {
                                    case "toggle on off":
                                        switch (node.payload) {
                                            case "ON":
                                                payload = "OFF";
                                                break;
                                            case "On":
                                                payload = "Off";
                                                break;
                                            case "on":
                                                payload = "off";
                                                break;
                                            case "OFF":
                                                payload = "ON";
                                                break;
                                            case "Off":
                                                payload = "On";
                                                break;
                                            case "off":
                                                payload = "on";
                                                break;
                                            default:
                                                payload = undefined;
                                        }
                                        break;
                                    case "toggle true false":
                                        switch (node.payload) {
                                            case true:
                                                payload = false;
                                                break;
                                            case false:
                                                payload = true;
                                                break;
                                            default:
                                                payload = undefined;
                                        }
                                        break;
                                    default:
                                        payload = config.sendValue;
                                        break;
                                }
                                break;
                            case "num":
                                payload = parseFloat(config.sendValue);
                                break;
                            case "bool":
                                payload = Boolean(config.sendValue);
                                break;
                            case "msg":
                                payload = node.sendValue;
                                break;
                        }
                        RED.util.setMessageProperty(orig.msg, config.sendValueTo, payload, true);
                        return orig.msg
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
                        //if (!msg) { return; };
                    });
                },
                
                beforeEmit: function (msg, value) {
                    //delete original message
                    Object.keys(msg).forEach(key => delete msg[key]);
                    //get manipulated message
                    msg = JSON.parse(data.get("emitMsg"));
                    if (config.ignoreCases == true) {
                        let value = RED.util.getMessageProperty(msg, config.payload).toString().toLowerCase();
                        RED.util.setMessageProperty(msg, config.payload, value, true);
                    }
                    //emit message
                    return { msg }
                
            }

            });
        }
        catch (e) {
            //console.log(e);
        }
        node.on("close", done);
    }
    RED.nodes.registerType("ui_multistyle-button",MS_Button);
}