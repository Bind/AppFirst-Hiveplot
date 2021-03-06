import sqlite3
import pycurl
import StringIO 
import simplejson as json
from Tkinter import *
import os

def as_node(dct):
    if 'Node' in dct:
        return complex(dct['ips'], 
                       dct['id'],
                       dct['host_name'])
    return dct

def as_edge(dct):
    if 'Edge' in dct:
        return complex(dct['hist_mean1'],
                       dct['swrite'],
                       dct['sread'],
                       dct['hist_mean2'],
                       dct['ttime2'],
                       dct['ttime1'],
                       dct['toID'],
                       dct['resp_avg1'],
                       dct['resp_avg2'],
                       dct['hist_std1'],
                       dct['snum'],
                       dct['tnum1'],
                       dct['fromID'],
                       dct['tnum2'],
                       dct['hist_std2'])
    return dct

#authentication information
AppFirst_url = "https://wwws.appfirst.com/api/topology/"
user_pwd = "admin@appfirst.com:586854651"

#sets up a buffer to catch the input from the API get call

cacheBuffer= StringIO.StringIO()
connection = sqlite3.connect('sqlite3.db')
database = connection.cursor()
# The Actual Call


#lets make a widget


c = pycurl.Curl()
c.setopt(c.URL, AppFirst_url)
c.setopt(c.VERBOSE, 1)
c.setopt(c.USERPWD, user_pwd)
c.setopt(c.WRITEFUNCTION,cacheBuffer.write)
c.perform()
c.close()


temp = json.loads( cacheBuffer.getvalue())


for n in temp.get('Node'):
    print n.get('ips')
    if not n.has_key('ips'):
        database.execute('INSERT INTO hiveplot_node (idnumber,ips,host_name,resp_avg) VALUES (?,?,?,?)',( n.get('id'), "none",n.get('host_name'),n.get('resp_avg')))
        if not n.has_key('resp_avg'):
             database.execute('INSERT INTO hiveplot_node (idnumber,ips,host_name,resp_avg) VALUES (?,?,?,?)',( n.get('id'), "none",n.get('host_name'),'none'))
            
    elif not n.has_key('resp_avg'):
         database.execute('INSERT INTO hiveplot_node (idnumber,ips,host_name,resp_avg) VALUES (?,?,?,?)',( n.get('id'), n.get('ips'),n.get('host_name'),'none'))
            

    else:
        database.execute('INSERT INTO hiveplot_node (idnumber,ips,host_name,resp_avg) VALUES (?,?,?,?)',( n.get('id'), n.get('ips'),n.get('host_name'),n.get('resp_avg')))

for n in temp.get('Edge'):
    if not temp.has_key('resp_avg2'):    
        database.execute('INSERT INTO hiveplot_edge (toID,fromID,hist_mean1,swrite, sread, hist_mean2, ttime2, ttime1, resp_avg1, resp_avg2, hist_std1, snum,tnum1, tnum2,  hist_std2) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)' ,( n.get('toID'), n.get('fromID'), n.get('hist_mean1'),n.get('swrite'),n.get('sread'),n.get('hist_mean2'),n.get('ttime2'),n.get('ttime1'),n.get('resp_avg1'),'null',n.get('hist_std1'), n.get('snum'),n.get('tnum1'), n.get('tnum2'), n.get('hist_std2')))


    else:
        database.execute('INSERT INTO hiveplot_edge (toID,fromID,hist_mean1,swrite, sread, hist_mean2, ttime2, ttime1, resp_avg1, resp_avg2, hist_std1, snum,tnum1, tnum2,  hist_std2) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)' ,( n.get('toID'), n.get('fromID'), n.get('hist_mean1'),n.get('swrite'),n.get('sread'),n.get('hist_mean2'),n.get('ttime2'),n.get('ttime1'),n.get('resp_avg1'),n.get(' resp_avg2'),n.get('hist_std1'), n.get('snum'),n.get('tnum1'), n.get('tnum2'), n.get('hist_std2')))
    
connection.commit()
connection.close()

#c.execute("INSERT INTO Node VALUES(?.?.?)

#Turns out file into a json data  object
#print read


#creates a server object from a stream


#display window


#root = Tk()
#left=Label(text="where am i?").pack()

#w = Label(root,justify = LEFT,text=server1.created)
#w.pack()
#root.mainloop()
