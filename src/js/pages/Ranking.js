// @flow weak

import diseasesRanking from '../data/diseasesRanking';
import log from 'loglevel';
import '../../sass/ranking.scss';

export default class Ranking {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  itemClick(event: Event, className: string, parent: HTMLElement) {
    event.preventDefault();
    const allItems = parent.querySelectorAll('li');
    if (allItems) {
      allItems.forEach(function(i) {
        i.classList.remove('active');
      });
    }
    const items = parent.querySelectorAll(`.${className}`);
    if (items) {
      items.forEach(function(i) {
        i.classList.add('active');
      });
    }
  }

  itemMouseOut(event: Event, className: string, parent: HTMLElement) {
    event.preventDefault();
    const items = parent.querySelectorAll(`.${className}`);
    if (items) {
      items.forEach(function(i) {
        i.classList.remove('hover');
      });
    }
  }

  itemMouseOver(event: Event, className: string, parent: HTMLElement) {
    event.preventDefault();
    const items = parent.querySelectorAll(`.${className}`);
    if (items) {
      items.forEach(function(i) {
        i.classList.add('hover');
      });
    }
  }

  scroll(event: Event, element: HTMLElement, parent: HTMLElement, btBack: HTMLButtonElement, btForward: HTMLButtonElement, direction: string) {
    event.preventDefault();
    const { target } = event;
    const currPos = element.offsetLeft;

    if (btBack) btBack.disabled = false;
    if (btForward) btForward.disabled = false;

    if (parent) {
      const parentWidth = parent.offsetWidth;
      const parentScroll = parent.scrollWidth;
      let offset = parentWidth;

      if (direction === 'forward' && (parentScroll - parentWidth) < parentWidth) {
        offset = parentScroll - parentWidth;
        btForward.disabled = true;
      } else if (direction === 'back' && Math.abs(currPos) < parentWidth) {
        offset = Math.abs(currPos);
        btBack.disabled = true;
      }
      const nextPos = direction === 'forward' ? currPos - offset : currPos + offset;
      element.style.left = `${(nextPos)}px`;
    }
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'ranking';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);

    const sticky = document.createElement('div');
    sticky.classList.add('sticky', 'header');
    elementsContainer.appendChild(sticky);

    const pageHeader = document.createElement('div');
    pageHeader.classList.add('page-header');
    sticky.appendChild(pageHeader);

    const container = document.createElement('div');
    container.classList.add('container');
    pageHeader.appendChild(container);

    const pageName = document.createElement('p');
    pageName.innerHTML = "Ranking";
    container.appendChild(pageName);

    const pageBody = document.createElement('div');
    pageBody.classList.add('page-body');
    elementsContainer.appendChild(pageBody);

    const sectionHeader = document.createElement('div');
    sectionHeader.classList.add('section-header', 'container');
    pageBody.appendChild(sectionHeader);

    const headerContent = document.createElement('div');
    headerContent.classList.add('header-content');
    sectionHeader.appendChild(headerContent);

    const title = document.createElement('h3');
    title.innerHTML = 'Top 10';
    headerContent.appendChild(title);

    const intro = document.createElement('p');
    intro.innerHTML = "These are the main health-related worries in the world, by year.";
    headerContent.appendChild(intro);

    const sectionBody = document.createElement('div');
    sectionBody.classList.add('section-body', 'container');
    pageBody.appendChild(sectionBody);

    const slideshow = document.createElement('div');
    slideshow.classList.add('slideshow');
    sectionBody.appendChild(slideshow);

    const btBack = document.createElement('button');
    btBack.classList.add('bt-arrow', 'back');
    btBack.disabled = true;
    let bindClick = evt => this.scroll(evt, rankingTable, rankingTableContainer, btBack, btForward, 'back');
    btBack.addEventListener('click', bindClick);
    btBack.addEventListener('touchend', bindClick);
    slideshow.appendChild(btBack);

    const rankingTableContainer = document.createElement('div');
    rankingTableContainer.classList.add('ranking-table-container');
    slideshow.appendChild(rankingTableContainer);

    const rankingTable = document.createElement('div');
    rankingTable.classList.add('ranking-table');
    rankingTableContainer.appendChild(rankingTable);

    for(const r of diseasesRanking) {
      const rankingColumn = document.createElement('div');
      rankingColumn.classList.add('ranking-column');
      rankingTable.appendChild(rankingColumn);

      const header = document.createElement('div');
      header.classList.add('header');
      rankingColumn.appendChild(header);

      let span = document.createElement('span');
      span.innerHTML = r.year;
      header.appendChild(span);

      const list = document.createElement('ul');
      list.classList.add('body');
      rankingColumn.appendChild(list);

      for(const d of r.diseases) {
        const item = document.createElement('li');
        const className = d.toLowerCase().replace('/', '-');
        item.classList.add(className);
        const bindClick = evt => this.itemClick(evt, className, rankingTable);
        const bindMouseOver = evt => this.itemMouseOver(evt, className, rankingTable);
        const bindMouseOut = evt => this.itemMouseOut(evt, className, rankingTable);
        item.addEventListener('click', bindClick);
        item.addEventListener('touchend', bindClick);
        item.addEventListener('mouseover', bindMouseOver);
        item.addEventListener('mouseout', bindMouseOut);
        list.appendChild(item);

        span = document.createElement('span');
        span.innerHTML = d;
        item.appendChild(span);
      }
    }

    const btForward = document.createElement('button');
    btForward.classList.add('bt-arrow', 'forward');
    bindClick = evt => this.scroll(evt, rankingTable, rankingTableContainer, btBack, btForward, 'forward');
    btForward.addEventListener('click', bindClick);
    btForward.addEventListener('touchend', bindClick);
    slideshow.appendChild(btForward);

    if (window.innerWidth > 600) {
      const parentWidth = rankingTableContainer.offsetWidth;
      const parentScroll = rankingTableContainer.scrollWidth;
      const offset = -(parentScroll - parentWidth);
      rankingTable.style.left = `${(offset)}px`;
      btBack.disabled = false;
      btForward.disabled = true;
    }
  }
}
