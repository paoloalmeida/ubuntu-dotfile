WakaTime for Visual Studio Code
===============================

Metrics, insights, and time tracking automatically generated from your programming activity.


Installation
------------

  1. Press `F1` or `CMD + Shift + P` and type `install`. Pick `Extensions: Install Extension`.

    ![type install](https://github.com/wakatime/vscode-wakatime/raw/master/./images/type-install.png)

  2. Type `wakatime` and hit `enter`.

    ![type wakatime](https://github.com/wakatime/vscode-wakatime/raw/master/./images/type-wakatime.png)

  3. Restart Visual Studio Code.

  4. Enter your [api key](https://wakatime.com/settings?apikey=true), then press `enter`.

    (If you already have a WakaTime plugin installed, you won't be prompted for your api key.)

  5. Use VSCode and your coding activity will be displayed on your [WakaTime dashboard](https://wakatime.com).


Usage
-----

Visit https://wakatime.com to see your coding activity.

![Project Overview](https://github.com/wakatime/vscode-wakatime/raw/master/./images/Screen-Shot-2016-03-21.png)


Configuring
-----------

Some settings are available from CMD+SHIFT+p, then typing `wakatime`.

Settings are stored in the INI file at `$HOME/.wakatime.cfg`.

More information can be found from [wakatime core](https://github.com/wakatime/wakatime#configuring).


Troubleshooting
---------------

First, turn on debug mode:

1. Press CMD+SHIFT+p
2. Type `wakatime.debug`, and press `Enter`.
3. Select `true`, then press `Enter`.

Next, open your Developer Console to view logs and errors:

`Help → Toggle Developer Tools`

Errors outside the scope of vscode-wakatime go to `~/.wakatime.log` from [wakatime-cli][wakatime-cli-help].

The [How to Debug Plugins][how to debug] guide shows how to check when coding activity was last received from your editor using the [User Agents API][user agents api].
For more general troubleshooting info, see the [wakatime-cli Troubleshooting Section][wakatime-cli-help].


[wakatime-cli-help]: https://github.com/wakatime/wakatime#troubleshooting
[how to debug]: https://wakatime.com/faq#debug-plugins
[user agents api]: https://wakatime.com/developers#user_agents
