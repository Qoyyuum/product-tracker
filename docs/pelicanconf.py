#!/usr/bin/env python
# -*- coding: utf-8 -*- #

AUTHOR = 'Product Tracker Team'
SITENAME = 'QR-Based Product Tracker Documentation'
SITEURL = ''

PATH = 'content'

TIMEZONE = 'UTC'

DEFAULT_LANG = 'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = (
    ('GitHub Repository', 'https://github.com/Qoyyuum/product-tracker'),
)

# Social widget
SOCIAL = ()

DEFAULT_PAGINATION = False

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True

# Theme settings
THEME = 'simple'

# Static paths
STATIC_PATHS = ['images', 'extra']

# Article/Page settings
ARTICLE_PATHS = ['articles']
PAGE_PATHS = ['pages']

# URL settings
ARTICLE_URL = '{slug}.html'
ARTICLE_SAVE_AS = '{slug}.html'
PAGE_URL = '{slug}.html'
PAGE_SAVE_AS = '{slug}.html'

# Markdown extensions
MARKDOWN = {
    'extension_configs': {
        'markdown.extensions.codehilite': {'css_class': 'highlight'},
        'markdown.extensions.extra': {},
        'markdown.extensions.meta': {},
        'markdown.extensions.toc': {},
        'markdown.extensions.fenced_code': {},
    },
    'output_format': 'html5',
}

# Plugin settings
PLUGIN_PATHS = []
PLUGINS = []

# Menu items
MENUITEMS = (
    ('Getting Started', '/getting-started.html'),
    ('Testing', '/testing.html'),
    ('Deployment', '/deployment.html'),
    ('Docker', '/docker.html'),
    ('CI/CD', '/ci-cd.html'),
)

# Display pages in menu
DISPLAY_PAGES_ON_MENU = True
DISPLAY_CATEGORIES_ON_MENU = False

# Output path
OUTPUT_PATH = 'output/'

# Delete output directory before generating
DELETE_OUTPUT_DIRECTORY = True

# Template pages
TEMPLATE_PAGES = {}

# Direct templates
DIRECT_TEMPLATES = ['index', 'archives']

# Disable unnecessary pages
AUTHOR_SAVE_AS = ''
AUTHORS_SAVE_AS = ''
CATEGORY_SAVE_AS = ''
CATEGORIES_SAVE_AS = ''
TAG_SAVE_AS = ''
TAGS_SAVE_AS = ''
