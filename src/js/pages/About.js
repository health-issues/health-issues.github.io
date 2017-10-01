// @flow weak

import log from 'loglevel';
import '../../sass/about.scss';

export default class About {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'about';
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
    pageName.innerHTML = "About";
    container.appendChild(pageName);

    const pageBody = document.createElement('div');
    pageBody.classList.add('page-body');
    elementsContainer.appendChild(pageBody);

    const sectionBody = document.createElement('div');
    sectionBody.classList.add('section-body', 'container');
    pageBody.appendChild(sectionBody);

    const row = document.createElement('div');
    row.classList.add('row');
    sectionBody.appendChild(row);

    const summary = document.createElement('div');
    summary.classList.add('summary');
    summary.innerHTML = "imnotfeelingwell.com is a collaboration between <a href='https://newslab.withgoogle.com/' target='_blank'>Google News Lab</a> and <a href='http://gianordoli.com' target='_blank'>Gabriel Gianordoli</a>. It uses Google Search Trends to identify patterns in health-related searches.";
    row.appendChild(summary);

    const aboutData = document.createElement('div');
    aboutData.classList.add('about-data');
    row.appendChild(aboutData);

      let title, colBody, subtitle, content;

      title = document.createElement('h3');
      title.innerHTML = "Data";
      aboutData.appendChild(title);

      colBody = document.createElement('div');
      colBody.classList.add('col-body');
      aboutData.appendChild(colBody);

        content = document.createElement('p');
        content.innerHTML = "All data in this project comes from Google Trends, and the search terms are <a href='https://www.google.com/intl/es419/insidesearch/features/search/knowledge.html' target='_blank'>Google Knowledge Graph</a> topics — which provides language-agnostic results and prevents “shingles” from returning searches for “roof shingles,” for example.";
        colBody.appendChild(content);

        content = document.createElement('p');
        content.innerHTML = "The seasonal and trend values are generated using a statistical method called seasonal trend decomposition. Take a look into this <a href='https://medium.com/@gianordoli/visualizing-health-bb36c600a8e4' target='_blank'>Medium post</a> for more information.";
        colBody.appendChild(content);

    const aboutTeam = document.createElement('div');
    aboutTeam.classList.add('about-team');
    row.appendChild(aboutTeam);

      title = document.createElement('h3');
      title.innerHTML = "Team";
      aboutTeam.appendChild(title);

      colBody = document.createElement('div');
      colBody.classList.add('col-body');
      aboutTeam.appendChild(colBody);

        subtitle = document.createElement('p');
        subtitle.classList.add('subtitle');
        subtitle.innerHTML = "Consultancy";
        colBody.appendChild(subtitle);

        content = document.createElement('p');
        content.innerHTML = "<a href='https://simonrogers.net/' target='_blank'>Simon Rogers</a> (Google News Lab) and <a href='http://www.thefunctionalart.com/' target='_blank'>Alberto Cairo</a>";
        colBody.appendChild(content);

        subtitle = document.createElement('p');
        subtitle.classList.add('subtitle');
        subtitle.innerHTML = "Data Support";
        colBody.appendChild(subtitle);

        content = document.createElement('p');
        content.innerHTML = "Sabrina Elfarra and Jennifer Lee (Google News Lab)";
        colBody.appendChild(content);

        subtitle = document.createElement('p');
        subtitle.classList.add('subtitle');
        subtitle.innerHTML = "Concept";
        colBody.appendChild(subtitle);

        content = document.createElement('p');
        content.innerHTML = "<a href='http://gianordoli.com' target='_blank'>Gabriel Gianordoli</a> and <a href='http://laurasalaberry.com' target='_blank'>Laura Salaberry</a>";
        colBody.appendChild(content);

        subtitle = document.createElement('p');
        subtitle.classList.add('subtitle');
        subtitle.innerHTML = "Data Visualization, Design and Development";
        colBody.appendChild(subtitle);

        content = document.createElement('p');
        content.innerHTML = "<a href='http://gianordoli.com' target='_blank'>Gabriel Gianordoli</a>";
        colBody.appendChild(content);

        subtitle = document.createElement('p');
        subtitle.classList.add('subtitle');
        subtitle.innerHTML = "Art Direction and Illustration";
        colBody.appendChild(subtitle);

        content = document.createElement('p');
        content.innerHTML = "<a href='http://laurasalaberry.com' target='_blank'>Laura Salaberry</a>";
        colBody.appendChild(content);

        subtitle = document.createElement('p');
        subtitle.classList.add('subtitle');
        subtitle.innerHTML = "Research";
        colBody.appendChild(subtitle);

        content = document.createElement('p');
        content.innerHTML = "<a href='https://twitter.com/andrebiernath' target='_blank'>André Biernath</a>";
        colBody.appendChild(content);

        subtitle = document.createElement('p');
        subtitle.classList.add('subtitle');
        subtitle.innerHTML = "Additional Development";
        colBody.appendChild(subtitle);

        content = document.createElement('p');
        content.innerHTML = "<a href='http://umisyam.com' target='_blank'>Umi Syam</a>";
        colBody.appendChild(content);
  }
}
