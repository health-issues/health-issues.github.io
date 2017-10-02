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
    // // Add listener for stl data
    // Shiny.addCustomMessageHandler('seasonalCallback', function(dataFromR) {
    //   log.info('From R: ', dataFromR);
    //   self.data.dataFromR.seasonal = dataFromR;
    //   self.dataProcessingCallback(explore, dataFromR);
    // });
    // Shiny.addCustomMessageHandler('trendCallback', function(dataFromR) {
    //   log.info('From R: ', dataFromR);
    //   self.data.dataFromR.trend = dataFromR;
    //   log.info(self.data);
    //   self.dataProcessingCallback(explore, dataFromR);
    // });
    // Shiny.addCustomMessageHandler('error', function(err) {
    //   log.error(err);
    //   self.explore.handleRError(explore);
    // });
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
      xhr.open('POST', 'http://localhost:4000/stl');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(`type=${type}&data=${data.join('|')}&diseases=${diseases}&geo=${geo}`);

      xhr.onreadystatechange = function(){
        console.log('Calling...');
        var DONE = 4;
        var OK = 200;
        if(xhr.readyState === DONE){
          console.log('Done.');
          if(xhr.status === OK){
            console.log(xhr.responseText);
            var dataFromR = JSON.parse(xhr.responseText);
            console.log(dataFromR);
              self.data.dataFromR[type] = dataFromR;
              self.dataProcessingCallback(explore, dataFromR);
          }else{
            console.log(xhr.status);
            self.explore.handleRError(explore);
          }
        }
      };
    }
  }
}
