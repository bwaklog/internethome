---
date: 2023-12-09
title: My first HSP talk
draft: false
layout: post_layout
description: HSP Project 2023 presentation
tags:
  - hsp
  - python
  - talk
  - cli
  - blog
  - tech
previewimage: /static/images/expo.webp
collections:
  - post
  - talks
  - tech
  - "2023"
---

I recently got the opportunity to take part in the project expo hosted by the club HSP part of PESU ECity campus. As part of this expo, I presented one of my on going projects [xkcd-grab](http://github.com/bwaklog/xkcd-grab) in-front of an amazing crowd. So lets get to the actual part of the blog, what this presentation was all about.

This relatively small project is somewhat of a playground for me to explore different searching algorithms and querying techniques. While this might have a niche target, I want to build this tool into a more robust API client. The roadmap of this current is to make a smart cli tool to find the most relevant comic based on a search query. The CLI itself is a minimal working tool I wrote with python. Besides using the api, i've created several extra features that completely changed original idea of the app.

This project begun in 2021, during my college entrance preparations. It started off as a basic API tool that worked with the xkcd api to fetch a comic based on a derised number. Looked cool at the time but was still pretty clunky. Why would you want to search something based on a number. Thats horrible. Well, the cli tool couldn't do that initially. This is when decided to implement some cool way you can interact with the cli, and find the comic right from your terminal.

## Fuzzy finding with levenshtine distance

Once i've got my hands on all the data needed, now was the time that I find a way to give the user the queried comic. My goal was to retrieve a comic based on a string, probably a mini description and use vector searching to find the most relevant comic. Seems good on paper, problem was the data. The api didn't provide any sort of description for over 1000+ comics. And with the limited time of 3 days, along with hours of college work, this approach wasn't feasible. The only way I could scrape out data would be using and OCR. The images of these comics have far better insight about whats happening thatn the description...mostly because there was nothing available. I will bring this up in a bit while talking about the little easter egg feature.

Now the only other option would be to use the titles of the comic. What the task was now is to achieve the best string approximation and provide the user with the 10 best matches. Levenshtein distance out of all the options was the simplest to implement given the time. Thing is I couldn't get this to work with an implementation that I craeted from defnition of the method to determine the levenshtine ratio. While getting the distance was a simple formula. Finding the ratio of kept me stuck for a while. It worked just fine, but the results didn't seem to align with premade modules that are supposed to do the same thing. While my results for the ratio were somewhat right, they were off by around 0.2 to 0.3. Turns out, the way fuzzywuzzy calculates the ratio is by using a slightly modified version of this formula.

By definition, if `l` is the Levenshtein distance, and `m` is the length of the longest of the two words, the ratio is given by `1-(l/m)`. However in the modified version, the sum of the lengths of the words were used for getting the value.

```python
def Levi_ratio(a: str, b: str) -> int:
    d = levi_distance(a, b)
    l = len(a) + len(b)
    return 1 - (d/l)
```

This was womething that I found out hours before the final presentation. So I had to go ahead with using the prebuilt module, which im not so proud. The results were good but not fully upto my expectation.

Here is a small demo of all of these things together. I appologise for the shitty quality of the gif. I yanked them from the presentation, and google slides doesn't like you downloading concents from a slide :P.

## Problems encountered

This project would have been a smooth sail if it werent for the big obstacle that I encountered where the data was simply insufficient. As a solution to this, I created a simple web scraper that works neatly along with the pre existing system that I made for the fuzzy finder. Instead of iteracting with the xkcd api, a neat google search querry along with some web scrappign gave some of the best output...I mean what else would I expect. Each xkcd url is in the following format.

```text
https://xkcd.com/<some number>/
```

Here is the basic structure of a `Comic` class.

```python
class Comic:
    self.num        # comic number
    self.url        # comci url (not the api endpoint)
    self.title      # comic title
    self.trans      # comic transcript (missing for over 1000+ comics)
    self.alt        # comic alt text
    self.img        # comic image url
    self.content    # comic content
```

The `content` is stripped out from the images using googles tessaract OCR engine, which has been made available to python.

How this app works is it dumps all the data locally in a csv for quick access in effort to use the api as less as possible. Ofcourse there a ton of comics that need to be retrived. In addition to the api call, running a sequential task of using an OCR to get the data from the comics is way too time consuming, especially when you are handling with anything over 1000s in number. Hence there was a need for a simple parallelisation operation

```python
def get_session():
    if not hasattr(thread_local, "session"):
        thread_local.session = requests.Session()
    return thread_local.session

# Returns a list of data in the same order as the csv file
def get_comic_data(comic_num):
    comic_data = Comic(num=comic_num) # this neatly give me a Comic object that i can handle
    # ...
    print(f"Data for comic {comic_num} fetched sucessfully")
    comic_data_nlist.append(data)


# Threading function to get all comcis
def fetch_all_comics(nums_list):
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(get_comic_data, nums_list)

    print("++++++ APPENDING & UPDATING COMICS +++++++")
```

What was supposed to be a 2 hour job of sequentially handling all the tasks got reduced down to 5 minutes (5 minutes and 23 seconds to be exact :P). This function is automatically called when any operation is called for using the CLI tool. Hence making data available for latest queries as well as for the fuzzy finder.
