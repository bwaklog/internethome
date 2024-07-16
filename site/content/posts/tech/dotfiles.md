---
title: Techstack
date: 2024-06-10
draft: false
collections: [tech]
layout: post_layout
description: Here are some things I cant live without on my system.
tags: ['blog', 'tech']
---

I've never had my self working on solely the terminal before. It would be only a few occasions when the GUI alternative was simply frustrating to use. I've since forced myself to try and venture more, and now I simply can't work without them. I have even lost count for the number of times i've used vim motions accidentally.

At first, yes these things were a bit intriguing, but once you leave the learning curve, everything just falls in place. You can find my dotfiles [here](https://github.com/bwaklog/dots)

![My Desk](https://i.imgur.com/miFjoRG.jpg)

## Text Editor

This is something that keeps changing once in a while, I like trying new stuff out there. But I always find myself getting back to [neovim](https://neovim.io/). While it took a while to get past that learning curve, I find it quite easy to use, and the motions are something I cant live without.

[Zed](https://zed.dev) is another editor I always find myself on. It supports vim motions out of the box, and the editor itself just insanely fast. And can't go without mentioning the amazing collaboration tool that it offers for free. Been trying emacs recently, and all i've experienced is frustration. It just has everything, and is a pain to use at times.

![xkcd comic - real programmers](https://imgs.xkcd.com/comics/real_programmers.png)
xkcd comic 378 - real programmers

## Window Manager

Well first of all I use a Mac. Nothing comes along with it, not even window snapping. So organisation just gets worse as you use it. At first, I got myself to use this app called Rectangle, which provided some neat keybindings to snap windows to a position, but none of it was *dynamic*.

While I tried out yabai, which is lightweight and probably the most popular one out there, I just felt lazy to maintain its config. Thats when I discovered Amethyst, which I must say is insanely good. And have been using it for almost 2 complete semesters. There wasn't any need for setting up a config from scratch and making keybindings with skhd (which I only use to make global hotkeys to open some specific apps) which solves my problem.

## Terminal Emulator

When I first started out on Mac, I didnt use anything but the default terminal application, which was restrictive in terms of customisation and basic colour display. iTerm solved most of those solutions for me, but even it couldn't display those nerd symbols without some weird cuts in the text. The scaling of some of the text and others in neovim weren't great.

Thats when I was introduced to GPU accelerated terminal emulators. *Kitty*, *Alacritty*, and as of now *WezTerm*.

Kitty has been great. Probably the most feature rich of the three. However, ever since I've messed up the config, I made my way to use wezterm.

So far, there hasn't been any issue, and maintaining the config has been really easy because of Lua. Maintaining my own neovim config before moving to Lazyvim has made me learn it to a decent extent, which makes this much easier.

## Extras

This is something i just pulled out of reddit recently and would love to share it. Thanks to [u/77ilham77](https://reddit.com/u/77ilham77), there is a way to move windows without the title bar and I absolutely love it. It's just a simple command and viola you are read. This allows you to hold down `<C-CMD>` and lets u move the window with your mouse.

```bash
defaults write -g NSWindowShouldDragOnGesture -bool true
```

![xkcd 196 - command line fu](https://imgs.xkcd.com/comics/command_line_fu.png)
xkcd comic 196 - command line fu
