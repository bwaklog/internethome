<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <!-- Strip trailing slash from a URL passed as $url -->
  <xsl:template name="clean-url">
    <xsl:param name="url"/>
    <xsl:choose>
      <xsl:when test="substring($url, string-length($url)) = '/'">
        <xsl:value-of select="substring($url, 1, string-length($url) - 1)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$url"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> Web Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <style type="text/css">
          *, *::before, *::after { box-sizing: border-box; }

          :root {
            --color-text:             #333343;
            --color-text-dim:         #3c3c51;
            --color-text-low:         #51525a50;
            --color-background:       #ffffff;
            --inline-code-bg:         #efeff1;
            --anchor-text:            #395a84;
            --style-container-width:  42rem;
            --style-body-font:        1rem;
            --style-heading-font:     1.65rem;
            --body-font-family:       Georgia, serif;
            --heading-font-family:    Georgia, serif;
          }

          html { background-color: var(--color-background); }

          body {
            margin: 0 auto;
            max-width: var(--style-container-width);
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            line-height: 1.6;
            font-size: var(--style-body-font);
            font-weight: 400;
            color: var(--color-text-dim);
            background-color: var(--color-background);
            padding: 1rem 20px;
            font-family: var(--body-font-family);
          }

          a {
            color: var(--anchor-text);
            text-decoration: underline;
            text-underline-offset: 4px;
          }
          a:visited { color: var(--anchor-text); text-decoration: none; }

          h1, h2, h3, h4, h5, h6 {
            font-family: var(--heading-font-family);
            font-weight: 450;
            color: var(--color-text);
            line-height: 1.2;
          }

          h1 { font-size: var(--style-heading-font); margin: 0 0 0.5rem; }
          h2 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; }
          h3 { font-size: 1rem; margin: 0; font-weight: 450; }

          p { margin: 0 0 0.8rem; }

          hr {
            opacity: 0.5;
            border: none;
            border-bottom: 1px solid var(--color-text-low);
            margin: 1.5rem 0;
          }

          .feed-notice {
            background-color: var(--inline-code-bg);
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
            margin-bottom: 1rem;
          }

          header { padding: 1.5rem 0 1rem; }

          .feed-icon {
            vertical-align: text-bottom;
            width: 1.2em;
            height: 1.2em;
            margin-right: 0.25rem;
          }

          header h2 {
            margin: 0.25rem 0 0.2rem;
            font-size: 1.1rem;
            font-weight: 400;
            color: var(--color-text-dim);
          }

          .head-link {
            display: inline-block;
            margin-top: 0.4rem;
            font-size: 0.95rem;
          }

          .post-list { list-style: none; padding: 0; margin: 0; }

          .post-list-element { margin-bottom: 0.8rem; }

          .post-list-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            column-gap: 1rem;
            align-items: start;
          }

          .post-list-title {
            color: var(--color-text);
            font-family: var(--heading-font-family);
            font-weight: 450;
          }

          .post-list-date {
            color: var(--color-text-dim);
            min-width: 100px;
            white-space: nowrap;
            justify-self: end;
            font-size: 0.9rem;
            opacity: 0.7;
          }

          @media (max-width: 640px) {
            .post-list-row { grid-template-columns: 1fr; }
            .post-list-date {
              min-width: 0;
              margin-top: 0.05rem;
              white-space: normal;
              justify-self: start;
              line-height: 1.3;
            }
          }

          footer {
            margin-top: auto;
            font-size: 0.8rem;
            opacity: 0.5;
            padding-top: 2rem;
          }
        </style>
      </head>
      <body>

        <div class="feed-notice">
          <strong>This is a web feed</strong> (RSS). Subscribe by copying the URL from
          the address bar into your newsreader. Visit
          <a href="https://aboutfeeds.com/">About Feeds</a> to get started — it's free.
        </div>

        <header>
          <h1>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="feed-icon"
                 id="RSSicon" viewBox="0 0 256 256">
              <defs>
                <linearGradient x1="0.085" y1="0.085" x2="0.915" y2="0.915" id="RSSg">
                  <stop offset="0.0"    stop-color="#E3702D"/>
                  <stop offset="0.1071" stop-color="#EA7D31"/>
                  <stop offset="0.3503" stop-color="#F69537"/>
                  <stop offset="0.5"    stop-color="#FB9E3A"/>
                  <stop offset="0.7016" stop-color="#EA7C31"/>
                  <stop offset="0.8866" stop-color="#DE642B"/>
                  <stop offset="1.0"    stop-color="#D95B29"/>
                </linearGradient>
              </defs>
              <rect width="256" height="256" rx="55" ry="55" x="0"  y="0"  fill="#CC5D15"/>
              <rect width="246" height="246" rx="50" ry="50" x="5"  y="5"  fill="#F49C52"/>
              <rect width="236" height="236" rx="47" ry="47" x="10" y="10" fill="url(#RSSg)"/>
              <circle cx="68" cy="189" r="24" fill="#FFF"/>
              <path d="M160 213h-34a82 82 0 0 0 -82 -82v-34a116 116 0 0 1 116 116z" fill="#FFF"/>
              <path d="M184 213A140 140 0 0 0 44 73 V 38a175 175 0 0 1 175 175z" fill="#FFF"/>
            </svg>
            Web Feed Preview
          </h1>
          <h2><xsl:value-of select="/rss/channel/title"/></h2>
          <p><xsl:value-of select="/rss/channel/description"/></p>
          <a class="head-link" target="_blank">
            <xsl:attribute name="href">
              <xsl:call-template name="clean-url">
                <xsl:with-param name="url" select="normalize-space(/rss/channel/link)"/>
              </xsl:call-template>
            </xsl:attribute>
            Visit Website &#x2192;
          </a>
        </header>

        <hr/>

        <h2>Recent Items</h2>

        <ul class="post-list">
          <xsl:for-each select="/rss/channel/item">
            <li class="post-list-element">
              <div class="post-list-row">
                <div>
                  <a class="post-list-title" target="_blank">
                    <xsl:attribute name="href">
                      <xsl:call-template name="clean-url">
                        <xsl:with-param name="url" select="normalize-space(link)"/>
                      </xsl:call-template>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </div>
                <div class="post-list-date">
                  <xsl:value-of select="pubDate"/>
                </div>
              </div>
            </li>
          </xsl:for-each>
        </ul>

        <footer>
          <p>Syndication feed &#x2014; subscribe in your newsreader of choice.</p>
        </footer>

      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
