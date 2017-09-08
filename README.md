# backspace-until-not-whitespace package

Press backspace to delete all the trailing whitespaces in a line.

#### Simple delete trailing whitespaces.

![Demo1](https://raw.githubusercontent.com/yubaoquan/yubaoquan.github.io/master/images/backspace-package-demo/oneLineDemo.gif)

#### Auto delete whitespaces line by line until find one line not trailing with whitespaces

![JS Demo](https://raw.githubusercontent.com/yubaoquan/yubaoquan.github.io/master/images/backspace-package-demo/js-demo.gif)

![HTML Demo](https://raw.githubusercontent.com/yubaoquan/yubaoquan.github.io/master/images/backspace-package-demo/html-demo.gif)

Setting:

1. `Multi Line Delete`: Enable this options to enable a backspace delete until find a none-whitespace line.
2. `Disabled File extensions`: This package will be disabled in files with suffix in this option .
3. `Use Keybinding`: Delete trailing whitespaces by only press `delete` key or use your custom keybinding. If enable this, the default keybinding will be `shift-delete`.

# Changelog

0.1.0 init

0.1.1

1. Fix bug: options not showing up;
2. Enhancement: Delete trailing spaces in none-blank line;

0.1.5 Remove default disabled file type: html.

0.1.6 Add keybinding option, so user can choose delete trailing spaces by backspace or other keybindings.

0.1.7 Fix shift-delete and duplicated event listeners.

0.1.8 Fix the wrong use of disposer causing an error when reload triggers.
