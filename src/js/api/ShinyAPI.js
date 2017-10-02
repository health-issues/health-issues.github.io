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

  updateData(type: string, data) {
    log.info('ShinyAPI updateData');
    log.info(type);
    const { dataToR, dataFromR } = this.data;
    if (arrayIsEqual(dataToR[type], data)) {
      this.dataProcessingCallback(this.explore, dataFromR[type]);

    } else {
      dataToR[type] = data;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:4000/stl');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(`type=${type}&data=${data}`);

      xhr.onreadystatechange = function(){
        console.log('Calling...');
        var DONE = 4;
        var OK = 200;
        if(xhr.readyState === DONE){
          console.log('Done.');
          if(xhr.status === OK){
            console.log(xhr.responseText);
            var response = JSON.parse(xhr.responseText);
            console.log(response);
            //   self.data.dataFromR.seasonal = dataFromR;
            //   self.dataProcessingCallback(explore, dataFromR);
          }else{
            console.log(xhr.status);
          }
        }
      };

    //   log.info(this.data);
    //   Shiny.onInputChange(type, data);
    }
  }
}
