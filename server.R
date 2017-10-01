library(shiny)
library(stlplus)

shinyServer(function(input, output, session) {
  
  print("Session started")
  
  session$allowReconnect(TRUE)
  
  observe({
    input$seasonal
    print(typeof(input$seasonal))
    print(input$seasonal)
    if (!is.null(input$seasonal) && typeof(input$seasonal) == "character") {
      print("Input in")
      myTS <- vectorToTS(input$seasonal)
      mySTL <- stl(myTS, t.window = NULL, s.window="periodic", robust=TRUE)
      mySTL.DF <- as.data.frame(mySTL$time.series)
      response <-  paste('seasonal:', toString(mySTL.DF$seasonal), collapse = "")
      session$sendCustomMessage(type = "seasonalCallback", response)
    } else {
      errorMessage()
    }
  })
  
  observe({
    input$trend
    print(typeof(input$trend))
    print(input$trend)
    if (!is.null(input$trend) && typeof(input$trend) == "character") {
      print("Input in")
      myTS <- vectorToTS(input$trend)
      mySTL <- stl(myTS, t.window = NULL, s.window="periodic", robust=TRUE)
      mySTL.DF <- as.data.frame(mySTL$time.series)
      response <-  paste('trend:', toString(mySTL.DF$trend), collapse = "")
      # response <-  paste('trend:', toString(mySTL.DF$trend))
      session$sendCustomMessage(type = "trendCallback", response)
    } else {
      errorMessage();
    }
  })
  
  errorMessage <- function() {
    msg <- "Null or non-character input"
    print(msg)
    session$sendCustomMessage(type = "error", msg)    
  }
})

vectorToTS <- function(data) {
  print("vectorToTs")
  ul <- unlist(strsplit(data,","))
  dataMatrix <- matrix(ul, length(data), 2, T)
  
  # Retrieving first and last months and weeks
  firstDateRow <- head(dataMatrix[,c(1)], n=1)
  firstDate <- strsplit(toString(firstDateRow), "-")
  firstYear <- as.integer(firstDate[[1]][1])
  firstMonth <- as.integer(firstDate[[1]][2])
  lastDateRow <- tail(dataMatrix[,c(1)], n=1)
  lastDate <- strsplit(toString(lastDateRow), "-")
  lastYear <- as.integer(lastDate[[1]][1])
  lastMonth <- as.integer(lastDate[[1]][2])
  
  values <-dataMatrix[,c(2)]
  
  print("data to time series")
  
  # Convert data to time series; using only second column (values)
  myTS <- ts(values, start=c(firstYear, firstMonth), end=c(lastYear, lastMonth), frequency=12)
  
  return(myTS)
}