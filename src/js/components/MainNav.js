// @flow weak

import log from 'loglevel';

export default class MainNav {

  data: {
    ticking: boolean,
    pagesMounted: boolean,
    offsetTops: Array<{
      id: string,
      top: number,
    }>,
    activePageIndex: number,
  };
  hamburger: HTMLElement;
  nav: HTMLElement;

  constructor(parentContainer: HTMLElement) {
    this.data = {
      ticking: false,
      pagesMounted: false,
      offsetTops: [
        { id: 'intro',
          top: 0 },
        { id: 'stories',
          top: 0 },
        { id: 'explore',
          top: 0 },
        { id: 'ranking',
            top: 0 },
        { id: 'about',
          top: 0 },
      ],
      activePageIndex: -1,
    }
    this.createElements(parentContainer);
  }

  checkScroll(scrollY: number, self: MainNav) {
    if (window.innerWidth > 600) {
      self.highlightPage(scrollY, self);
    }
  }

  highlightPage(scrollY: number, self: MainNav) {
    const { pagesMounted } = self.data;
    let { offsetTops } = self.data;
    if (!pagesMounted) {
      const pagesMounted = self.checkPagesMounted();
      self.updateData({ pagesMounted });
    } else if (offsetTops.find(obj => obj.top === 0)) {
      self.getOffsetTops(self);
    } else {
      const pages = offsetTops.filter(obj => scrollY >= obj.top - 36);
      const activePageIndex = pages.length-1;
      if (activePageIndex > -1 && activePageIndex !== self.data.activePageIndex) {
        const links = self.nav.querySelectorAll('a');
        for (const l of links) {
          l.classList.remove('active');
        }
        links[activePageIndex].classList.add('active');
        self.updateData({ activePageIndex });
      }
    }
  }

  checkPagesMounted() {
    const pages = document.querySelectorAll('.page');
    let pagesMounted = true;
    for (const p of pages) {
      pagesMounted = p.getBoundingClientRect().height === 0 ? false : true;
    }
    return pagesMounted;
  }

  getOffsetTops(self: MainNav) {
    let { offsetTops } = self.data;
    const pages = document.querySelectorAll('.page');
    for (const p of pages) {
      const obj = offsetTops.find( obj => obj.id === p.id);
      // if (obj) obj.top = p.getBoundingClientRect().top;
      if (obj) {
        obj.top = self.getOffsetTop(p);
        log.info(obj.top);
      }
    }
    self.updateData({ offsetTops });
  }

  getOffsetTop( elem ) {
    let offsetTop = 0;
    do {
      if ( !isNaN( elem.offsetTop ) ) {
      offsetTop += elem.offsetTop;
      }
    } while( elem = elem.offsetParent );
    return offsetTop;
  }

  // moveBurger(scrollY: number, self: MainNav) {
  //   const { hamburger } = self;
  //   let { introIsMounted, storiesOffsetTop } = self.data;
  //
  //   if (!introIsMounted) {
  //     const introPage = document.querySelector('#intro.page');
  //     if (introPage) introIsMounted = introPage.getBoundingClientRect().height === 0 ? false : true;
  //     self.updateData({ introIsMounted });
  //
  //   } else if (storiesOffsetTop === 0) {
  //     const storiesPage = document.querySelector('#stories.page');
  //     if (storiesPage) storiesOffsetTop = storiesPage.getBoundingClientRect().top;
  //     self.updateData({ storiesOffsetTop });
  //   } else if (scrollY > storiesOffsetTop) {
  //     hamburger.classList.add('moved');
  //   } else {
  //     hamburger.classList.remove('moved');
  //   }
  // }

  hamburgerClick(evt: Event, self: MainNav) {
    const { nav } = self;
    nav.classList.add('open');
  }

  closeClick(evt: Event, self: MainNav) {
    const { nav } = self;
    nav.classList.remove('open');
  }

  navMouseLeave(evt: Event, self: MainNav) {
    const { nav } = self;
    nav.classList.remove('open');
  }

  updateData(obj) {
    const { data } = this;
    Object.assign(data, obj);
  }

  createElements(parentContainer: HTMLElement) {
    const mainNavContainer = document.createElement('div');
    mainNavContainer.classList.add('main-nav', 'sticky');
    parentContainer.appendChild(mainNavContainer);

    this.hamburger = document.createElement('div');
    const { hamburger } = this;
    hamburger.classList.add('hamburger');
    const bindHamburgerClick = evt => this.hamburgerClick(evt, this);
    hamburger.addEventListener('click', bindHamburgerClick);
    mainNavContainer.appendChild(hamburger);

    this.nav = document.createElement('nav');
    const { nav } = this;
    const bindNavMouseLeave = evt => this.navMouseLeave(evt, this);
    nav.addEventListener('mouseleave', bindNavMouseLeave);
    mainNavContainer.appendChild(nav);

    const close = document.createElement('div');
    close.classList.add('close');
    const bindCloseClick = evt => this.closeClick(evt, this);
    close.addEventListener('click', bindCloseClick);
    nav.appendChild(close);

    const linksContainer = document.createElement('ul');
    nav.appendChild(linksContainer);

    const links = ['intro', 'stories', 'explore', 'ranking', 'about'];
    for (const l of links) {
      const li = document.createElement('li');
      linksContainer.appendChild(li);

      const button = document.createElement('a');
      button.innerHTML = l;
      button.setAttribute('href', `#${l}`);
      button.addEventListener('click', bindCloseClick);
      button.addEventListener('touchend', bindCloseClick);
      li.appendChild(button);
    }
  }
}
