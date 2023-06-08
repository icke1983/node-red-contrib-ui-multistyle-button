# node-red-contrib-ui-multistyle-button Readme
node-red-contrib-ui-multistyle-button is a button for the Node-RED Dashboard that can be styled by input

## Install

### Directly in Node-RED via palette manager

Start Node-RED

Select 'Manage palette' from menu top-right

Click on the Install tab

Search for ui-multistyle-button in the searchbar and find node-red-contrib-ui-multistyle-button

### Manual install

Run command on Node-RED installation directory.

    npm install node-red-contrib-ui-multistyle-button

## Usage

That Button can be styled by the input. Therfor you have to specify the styleoptions of any value, you want.
Set the default style.

![default_style Example](https://raw.githubusercontent.com/icke1983/node-red-contrib-ui-multistyle-button/master/images/default_style.PNG)

For each added **value**, you can set the style-properties separately.

![values Example](https://raw.githubusercontent.com/icke1983/node-red-contrib-ui-multistyle-button/master/images/values.PNG)

You can use **fa-icons**, **mi-icon** and all other icons that are installed.

The colors can be specified by name (e.g. **red**), by HEX code (e.g. **#FF0000**) or by rgb-command (e.g. **rgb (255, 0, 0)** ).
Also the color can get the value of a **'msg.object'**. Therfor set the colorfield to `{{msg.color}}`

Enable shadows for the icon an thh text seperatly.

![shadow Example](https://raw.githubusercontent.com/icke1983/node-red-contrib-ui-multistyle-button/master/images/shadow.PNG)

Add an additional Label into one corner of the button.

![second_label Example](https://raw.githubusercontent.com/icke1983/node-red-contrib-ui-multistyle-button/master/images/second_label.PNG)

Leave blank the styleoptions if you don't want to specify them.

Determine which **'msg.object'** should be considered.
It can also be any other object than **'msg.payload'**.
You can look at **'msg.payload.power'** for example.
Set the option for behavior when no match is found.
Set the option for use or ignore cases of the value letters 

![msg_object Example](https://raw.githubusercontent.com/icke1983/node-red-contrib-ui-multistyle-button/master/images/msg_object.PNG)

Determine the **value** and the **destination 'msg.object'** which will be sent at buttonclick.
you can send a **string**, a **number**, a **bool value** or the **value of an input 'msg.objeck'**
![send_value Example](https://raw.githubusercontent.com/icke1983/node-red-contrib-ui-multistyle-button/master/images/send_value.PNG)

Special **strings** are `toggle on off` or `toggle true false`.
That will toggle the selected **input 'msg.object'** to the **output** at buttonclick.
![special_strings Example](https://raw.githubusercontent.com/icke1983/node-red-contrib-ui-multistyle-button/master/images/special_strings.PNG)

## License

The MIT License
