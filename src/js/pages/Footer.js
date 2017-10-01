// @flow weak

import log from 'loglevel';

export default class Footer {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  injectTwitterCode() {
    window.twttr = (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };

      return t;
    }(document, "script", "twitter-wjs"));
  }

  injectFBCode() {
    const body = document.querySelector('body');
    if (body) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      body.appendChild(fbRoot);

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.9&appId=1409691509112381";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('footer');
    parentContainer.appendChild(elementsContainer);

    const container = document.createElement('div');
    container.classList.add('container');
    elementsContainer.appendChild(container);

    const websiteUrl = document.createElement('p');
    websiteUrl.classList.add('website-url');
    websiteUrl.innerHTML = 'imnotfeelingwell.com';
    container.appendChild(websiteUrl);

    const socialMedia = document.createElement('div');
    socialMedia.classList.add('social-media');
    container.appendChild(socialMedia);

    // const twitterShareButton = document.createElement('a');
    // twitterShareButton.classList.add('twitter-share-button');
    // const url = 'https://twitter.com/intent/tweet';
    // const text = encodeURIComponent('Search trends and patterns for health issues via Google searches');
    // twitterShareButton.setAttribute('href', `${url}?text=${text}`);
    // twitterShareButton.setAttribute('data-size', 'large');
    // socialMedia.appendChild(twitterShareButton);

    const fbShareButton = document.createElement('div');
    fbShareButton.classList.add('fb-share-button');
    fbShareButton.setAttribute('data-href', 'http://www.imnotfeelingwell.com/');
    fbShareButton.setAttribute('data-layout', 'button');
    fbShareButton.setAttribute('data-size', 'large');
    fbShareButton.setAttribute('data-mobile-iframe', 'true');
    socialMedia.appendChild(fbShareButton);

    const fbLink = document.createElement('a');
    fbLink.classList.add('fb-xfbml-parse-ignore');
    fbLink.setAttribute('target', '_blank');
    fbLink.setAttribute('href', 'https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.imnotfeelingwell.com%2F&amp;src=sdkpreparse');
    fbLink.innerHTML = 'Share';
    fbShareButton.appendChild(fbLink);

    // this.injectTwitterCode();
    this.injectFBCode();
  }
}
