import random
from kmean_wanhy149 import kmeans
def convert(x):
    if len(x.strip()) > 0:
        return int(x)
    return None

data = {}

##  read data from file
with open('assign1-data.csv', 'r') as fr:
    line = fr.readline()
    line = fr.readline()
    i = 0
    while len(line) > 0:
        parts = line[:-1].split(',')
        i += 1
        if not data.__contains__(parts[0]):
            data[parts[0]] = list(map(convert, parts[1:]))
        #else:
        #    print(parts[0])
        line = fr.readline()

##  function for filtering None value objects
def check_none(x):
    return not x[1].__contains__(None)
## filter dataset
data = dict(filter(check_none, data.items()))

cluster = dict()
cluster_count = 2

## construct the initial centeroid
for i in range(cluster_count):
    cluster[f'k{i+1}'] = list(data.keys())[random.randrange(0, len(data)-1)]


print("initial centroid",cluster)
kmeans(data, cluster).run()
    


