---
title: WFS(Vivid) Retrive and Analysis
#cover: /assets/images/unisa.jpg
icon: earth-asia
date: 2023-07-10
category:
  - geoscience
tag:
  - postgis
  - crawler
  - ogc
  - wfs
star: false
sticky: true
---

## The whole process

```mermaid
---
title: The process for libft
---
flowchart LR
    start((Start))--> key[Get asscess key]
    key --> getdata[Download data]
    getdata --> process[Remove Duplication <br> And Import to DB]
    process --> cal[Calculation &<br> Report]
    cal--> End{{Finish}}
```

## Get the Key
Details refer to your own account

## Download data

### Analysis
Using WFS client for viewing the layers first. Details refer the picture below
![The layers of vivid data](/assets/images/geoscience/cn/vivid_layers.png)

According to the picture above, there are 9 layers totally. The meaning for each layers is listed below.

| layer | Meaning |
| -- | -- |
| BasicFeature | - |
| CollectedContent | - |
| FinishedFeature | - |
| ImageInMosaicFeature | - |
| Maxar Catalog Mosaic Products | The big data zone|
| Maxar Catalog Mosaic Seamlines | vivid masic line, classed by product line, producing line version etc.|
| Maxar Catalog Mosaic Tiles | The block related with vivid product.(irrelevant) |
| StandardFeature | - |
| TileMatrixFeature | - |

According to our needs, all the data related with Mosaic need to be downloaded and analysied.

### Download

#### Crawler code
The data is released via WFS service. A web crawler will be implemented for retriving the data. 

Because of the whole world data is too large to download at the same time. The world need to be splited into several blocks, then we should download the data from according the area of each block.
::: code-tabs
@tab dg_downloader
``` python
import requests as req
import random
import datetime as dt
import sys
import math
import threading
import time
import json
import sys
import os
import gzip
sys.path.append('.')
from tile_util import *
from thread_util import *

class dg_downloader:
    def __init__(self, connectid, type_name, version='2.0.0', format='application%2Fjson'):
        self.base_url = 'https://securewatch.digitalglobe.com'
        self.tile_obj = tile_util()
        self.__connectid__ = connectid
        self.__type_name__ = type_name
        self.__version__   = version
        self.__format__    = format
        
        # 模板参数说明
        # @param connectId the connect id
        # @param type_name layername
        # @param lat_min   the minimum latitude
        # @param lng_min   the minimum longtitude
        # @param lat_max   the maximum latitude
        # @param lng_max   the minimum longtitude
        # @param version   the ogc service version (such as：2.0.0)
        # @param format    the output format，(such as：application/json)
        self.wfs_template = self.base_url + '/catalogservice/wfsaccess?CONNECTID={connectId}&SERVICE=WFS&REQUEST=GetFeature&VERSION={version}&TYPENAMES={type_name}&TYPENAME={type_name}&STARTINDEX=0&COUNT=1000000&SRSNAME=urn:ogc:def:crs:EPSG::4326&BBOX={lat_min},{lng_min},{lat_max},{lng_max},urn:ogc:def:crs:EPSG::4326&outputFormat={format}'

    def __del__(self):
        pass
        
    def downlaod(self, base_tile, target_level, filename):
        '''
        @param base_tile    The base tile()
        @param target_level
        @param filename
        The data is retrived from server block by block. The base_tile will determine a big blog for downloading, the target_level define which level will continue split the base_tile.

        '''
        self._base_tile_ = base_tile
        sub_tiles = self.tile_obj.getWMTSSubTile(base_tile, target_level)
        output_file = {
            'log': open(f'{filename}.geojson', 'w'),
            'locker': threading.Lock()
        }
        
        th_pool = thread_util(10)
        
        for sub_tile in sub_tiles:
            lng_min, lng_max, lat_min, lat_max  = self.tile_obj.getBoundingBox(sub_tile)
            version   = self.__version__
            format    = self.__format__
            type_name = self.__type_name__
            connectId = self.__connectid__
            
            url = eval(f'f"{self.wfs_template}"')
            req_param = sub_tile
            print(url)
            th_pool.process(self.thread_req, (url, req_param, output_file), req_param)
        th_pool.wait()
        with output_file['locker']:
            output_file['log'].close()
        
    def thread_req(self, url, req_param, output_file):
        ret = self.getRespInfo(url, req_param)
        with output_file['locker']:
            output_file['log'].write(f'{ret}\n')
        
    def getRespInfo(self, url, req_param):
        resp = None
        rc = None
        try:
            headers= {}
            resp = req.get(url, headers = headers)
        except Exception as e:
            pass
        finally:
            if resp:
                resp_code = resp.status_code
                if 200 == resp_code:
                    #print(resp.text)
                    content = resp.text
                    #content = gzip.decompress(resp.content).decode()
                    rc = f'{req_param}|{content}'
                resp.close()
        return rc
```
@tab tile_util
``` python
import math

'''
The code of quad
-------
3  |  2
-------
0  |  1
-------
The first layer of the earth will be split into 
| 0 | 1 |


---------------------------------------------------
The code of WMTS will start from the left-top corner.
The zero layer will split into

| 0-0-0 | 0-1-0 |

The first layer 
| 1-0-0 | 1-1-0 | 1-2-0 | 1-3-0 |
---------------------------------
| 1-0-1 | 1-1-1 | 1-2-1 | 1-3-1 |
'''
class tile_util:
    def __getGeojsonTemplate__(self, name):
        return {
            "type": "FeatureCollection",
            "name": name,
            "crs": {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                }
            },
            "features": []
        }
    
    def Quad2WMTS(self, quad):
        tilew = 360/(2**len(quad))
        centerx = 0
        centery = 0
        for i in range(len(quad)):
            tilew = 360/(2**(i+1))
            if i == 0:
                if quad[i] == '0':
                    centerx = -90
                    centery = 0
                else:
                    centerx = 90
                    centery = 0
            else:
                if quad[i] == '0':
                    centerx -= tilew/2
                    centery -= tilew/2
                if quad[i] == '1':
                    centerx += tilew/2
                    centery -= tilew/2
                if quad[i] == '2':
                    centerx += tilew/2
                    centery += tilew/2
                if quad[i] == '3':
                    centerx -= tilew/2
                    centery += tilew/2
        wmtsl = len(quad)-1
        wmts_tilew = 180/(2**wmtsl)
        #print(centerx, centery, wmts_tilew)
        tilex = math.floor((centerx+180)/wmts_tilew)
        tiley = math.floor(-(centery-90)/wmts_tilew)
        return wmtsl, tilex, tiley
    
    # Get the sub block list of quad until the specified level
    def getWMTSSubTile(self, quad, level):
        rc = list()
        if len(quad) < level-1:
            rc.extend(self.getWMTSSubTile(quad+'0', level))
            rc.extend(self.getWMTSSubTile(quad+'1', level))
            rc.extend(self.getWMTSSubTile(quad+'2', level))
            rc.extend(self.getWMTSSubTile(quad+'3', level))
            return rc
        else:
            return [quad + '0', quad + '1', quad + '2', quad + '3', ]
    
    # Get the quad number on specified level according to latitude and longtitude.
    def getTileQuad(self, lng, lat, level):
        minx = -180
        maxx = 180
        miny = -90
        maxy = 90
        
        centerx = 0
        centery = 0
        tilew = 180
        ret = ''
        for l in range(level):
            if l <= 0:
                if lng <= 0:
                    centerx = -90
                    centery = 0
                    ret += '0'
                else:
                    centerx = 90
                    centery = 0
                    ret += '1'
            else:
                if lng < centerx and lat < centery:
                    ret += '0'
                    centerx -= tilew/2
                    centery -= tilew/2
                elif lng > centerx and lat < centery:
                    ret += '1'
                    centerx += tilew/2
                    centery -= tilew/2
                elif lng > centerx and lat > centery:
                    ret += '2'
                    centerx += tilew/2
                    centery += tilew/2
                else:
                    ret += '3'
                    centerx -= tilew/2
                    centery += tilew/2
            tilew /= 2
        return ret
    
    def getBoundingBox(self, quad):
        '''
        Get the bounding box of quad block
        '''
        l, x, y = self.Quad2WMTS(quad)
        tilew  = 180/(2**l)
        maxx = x*tilew + tilew - 180
        minx = x*tilew + 0 -180
        maxy = 90 - (y*tilew + 0)
        miny = 90 - (y*tilew + tilew)
        return minx, maxx, miny, maxy 
    
    def getGeojson(self, quad, targetLevel = None):
        '''
        Get the geojson of quad if the targetLevel is not specified.
        Get the geojson for all sub block until targetLevel regard as quad as a base block
        '''
        rc = None
        if targetLevel:
            rc = self.__getGeojsonTemplate__(f'{quad}-{targetLevel}')
            subs = self.getWMTSSubTile(quad, targetLevel)
            for i in subs:
                rc['features'].append(self.__getFeatureJson__(i))
        else:
            rc = self.__getGeojsonTemplate__(f'{quad}')
            rc['features'].append(self.__getFeatureJson__(quad))
        return rc
    
    def __getFeatureJson__(self, quad):
        '''
        Get the geojson of quad
        '''
        ret = {
                "type": "Feature",
                "properties": dict(),
                "geometry": {
                    "type": "Polygon",
                    "coordinates": list()
                }
            }
        minx, maxx, miny, maxy  = self.getBoundingBox(quad)
        ret['geometry']['coordinates'].append( [[minx, miny], [minx, maxy], [maxx, maxy], [maxx, miny], [minx, miny]])
        ret['properties']['quad'] = quad
        ret['properties']['wmts'] = self.Quad2WMTS(quad)
        return ret
```

@tab thread_util
``` python
import threading

class thread_util:
    def __init__(self, thread_max = 20):
        self.__thread_pool__ = list()
        self.__thread_max__ = 1
        if thread_max:
            self.__thread_max__ = thread_max
    
    def process(self, target, args, name):
        th = threading.Thread(target=target, args=args, name= name)
        self.__thread_pool__.append(th)
        th.start()
        self.__update_thread__()
    
    def wait(self):
        self.__update_thread__(1)
    
    def __update_thread__(self, count = None):
        c = self.__thread_max__
        if count:
            c = count
        while len(self.__thread_pool__) >= c:
            dead_pool = []
            for th in self.__thread_pool__:
                if not th.is_alive():
                    dead_pool.append(th)
            for item in dead_pool:
                self.__thread_pool__.remove(item)
            #time.sleep(0.1)
```
:::

#### Retrive data

::: code-tabs
@tab retrive data
``` python
# DigitalGlobe:FinishedFeature              ：-
# DigitalGlobe:BasicFeature                 ：-
# DigitalGlobe:CollectedContent             ：-
# DigitalGlobe:ImageInMosaicFeature         ：-
# DigitalGlobe:MaxarCatalogMosaicProducts   ：Product area（such as：VIVID_AS33_20Q4）
# DigitalGlobe:MaxarCatalogMosaicSeamlines  ：seamlines for vivid
# DigitalGlobe:MaxarCatalogMosaicTiles      ：- 
# DigitalGlobe:StandardFeature              ：unable load  504
# DigitalGlobe:TileMatrixFeature            ：unable load  500
if __name__ == '__main__':
    connect_id = ''      #use your own connect_id
    type_name  = 'DigitalGlobe:MaxarCatalogMosaicTiles'   #图层名称
    
    tile_obj = tile_util()                
    #quad = tile_obj.getTileQuad(116, 39, 8)
    quad = '0'
    target_l = 9
    dg_dobj = dg_downloader(connect_id, type_name)
    dg_dobj.downlaod(quad, target_l, 'MaxarCatalogMosaicTiles')
```

@tab tile_util sample
``` python
with open('D:\\aa.geojson', 'w') as fw:
    fw.write(json.dumps(tile_obj.getGeojson('0', 2)))
```
:::


#### Parse data


