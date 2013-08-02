from django.conf.urls import patterns, url

from hiveplot import views

urlpatterns = patterns('',
                       url(r'^$',views.index ,name="index"),
                       
                       url(r'^hiveplot$', 'index'),
                       url(r'^hiveplot/$', 'index'),
                       url(r'^api/server/topology/data$', views.api_topology_data, name="topology"),
    		       url(r'^api/server/process/data$', views.api_server_id_process, name="server_process"),
      			 url(r'^api/server/process/data/detail$', views.api_server_id_process_data, name="server_process_detail"),
                       url(r'^api/server/data$', views.api_servers_data, name = "server_data"),
                       url(r'^api/server/tags/data$', views.api_server_tags_data, name = "tag_data"),
    

)
