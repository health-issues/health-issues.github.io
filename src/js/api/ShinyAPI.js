// @flow weak

import Explore from '../pages/Explore';
import { arrayIsEqual } from '../util/util';
import log from 'loglevel';

export default class ShinyAPI {

  data: {
    dataToR: {
      seasonal: string[],
      trend: string[],
    },
    dataFromR: {
      seasonal: string,
      trend: string,
    }
  }

  dataProcessingCallback: () => {};
  isInitialized: boolean;
  explore: Explore;

  constructor() {
    this.data = {
      dataToR: {
        seasonal: [],
        trend: [],
      },
      dataFromR: {
        seasonal: '',
        trend: '',
      }
    };
    log.info('ShinyAPI');
  }

  setCallback(explore: Explore, callback: () => {}) {
    log.info('Shiny setCallback');
    const self = this;
    self.dataProcessingCallback = callback;
    self.explore = explore;
  }

  updateData(type: string, data, diseases: Array<String>, geo: String) {
    log.info('ShinyAPI updateData');
    log.info(type);
    const self = this;
    const { dataToR, dataFromR } = self.data;
    if (arrayIsEqual(dataToR[type], data)) {
      self.dataProcessingCallback(self.explore, dataFromR[type]);

    } else {
      dataToR[type] = data;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', ENV !== 'DEVELOPMENT' ? 'http://52.3.72.44:4000/stl' : 'http://localhost:4000/stl');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(`type=${type}&data=${data.join('|')}&diseases=${diseases}&geo=${geo}`);

      xhr.onreadystatechange = function(){
        log.info('Calling...');
        var DONE = 4;
        var OK = 200;
        if(xhr.readyState === DONE){
          log.info('Done.');
          if(xhr.status === OK){
            log.info(xhr.responseText);
            const dataFromR = JSON.parse(xhr.responseText);
            log.info(dataFromR);
            self.data.dataFromR[type] = dataFromR;
            self.dataProcessingCallback(explore, dataFromR);
          }else{
            log.info(xhr.status);
            self.dataProcessingCallback(explore, null);
          }
        }
      };
    }
  }
}
