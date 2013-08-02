
from django.shortcuts import get_object_or_404, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.views import generic
from django.utils import simplejson
from hiveplot.models import Node, Edge
from django.conf import settings

import urllib2
import base64
from urlparse import urlparse
import sys
import re

import simplejson as json

def base_url(request):
    """Adds the base url to the context."""
    base_url = settings.BASE_URL
    return {'BASE_URL': base_url}

def index(request):
    hiveplots = []
    hiveplots.append({
            "id" : 1,
            "Nodes" : [],
            "Edges": [],
            "timerInterval": 1,
            "timerIntervalCounter":0,
            "config": {"branches" : 3 , "nodeRadius": 4, "heatMapped": False, "zMetric":  "fromID > 0", "yMetric": "fromID = 0", "xMetric": "fromID>5 && toID>5"}}) 

    return render_to_response("node/index.html",{"hiveplots":hiveplots}, context_instance = RequestContext(request))



def api_servers_data(request):
    url = settings.BASE_URL + "servers/"
    return api_get_data(url)

def api_server_tags_data(request):
    url = settings.BASE_URL + "server_tags/"
    return api_get_data(url)
            

def api_server_id_process(request):
	url = settings.BASE_URL + 'servers/' + request.GET.get('id') + '/processes/'
	return api_get_data(url)


def api_server_id_process_data(request):
	url = settings.BASE_URL + 'processes/' + request.GET.get('uid') + '/detail/'
	return api_get_data(url)


def api_topology_data(request):
    url = settings.BASE_URL + "topology/"
    return api_get_data(url)



def api_get_data(url):
    base64string = base64.encodestring('%s:%s' %(settings.USERNAME,settings.API_KEY))[:-1]
    authheader = "Basic %s" % base64string

    req = urllib2.Request(url)
    req.add_header("Authorization", authheader)

    try: 
        handle = urllib2.urlopen(req)
    except IOError, e:
        sys.exit(1)
    
    return_data = handle.read()

    return HttpResponse(return_data ,mimetype="application/json")
