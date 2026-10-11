import psutil as ps
from db import write_to_table

def system():
    system_info_object = {
        "cpu_metrics": cpu_metrics(),
        "core_metrics": core_metrics(),
        "mac_os_specific_metrics": mac_os_specific() if not None else None,
        "linux_specific_metrics": linux_specific() if not None else None,
        "swap_metrics": swap_metrics(),
        "process_metrics": process_metrics()
    }
    write_to_table(system_info_object)

def cpu_metrics():
    obj = {"cpu": {"times": {}}}
    times = ps.cpu_times()
    obj["cpu"]["cores"] = ps.cpu_count()
    obj["cpu"]["times"]["user"] = times.user
    obj["cpu"]["times"]["system"] = times.system
    obj["cpu"]["times"]["idle"] = times.idle
    obj["cpu"]["times"]["nice"] = getattr(times, 'nice', 0.0)
    obj["cpu"]["percent"] = ps.cpu_percent(interval=None)
    return obj

def core_metrics():
    obj = {}
    total_ram = bytes_to_gb(ps.virtual_memory().total)
    obj["active_ram_gb"] = bytes_to_gb(ps.virtual_memory().active)
    obj["available_ram_gb"] = bytes_to_gb(ps.virtual_memory().available)
    obj["used_ram_gb"] = bytes_to_gb(ps.virtual_memory().used)
    obj["percent"] = (total_ram - obj["available_ram_gb"] / total_ram) * 100
    return obj

def mac_os_specific():
    obj = {}
    try:
        obj["wired_memory"] = bytes_to_gb(ps.virtual_memory().wired)
        obj["inactive_memory"] = bytes_to_gb(ps.virtual_memory().inactive)
        return obj
    except AttributeError as e:
        return None

def linux_specific():
    try:
        obj = {}
        obj["cached_memory"] = bytes_to_gb(ps.virtual_memory().cached)
        obj["shared_memory"] = bytes_to_gb(ps.virtual_memory().shared)
        return obj
    except AttributeError as e:
        return None
    
def swap_metrics():
    obj = {}
    obj["total_swap_memory"] = ps.swap_memory().total
    obj["used_swap_memory"] = ps.swap_memory().used
    obj["sin"] = ps.swap_memory().sin
    obj["sout"] = ps.swap_memory().sout
    return obj

def process_metrics():
    obj = {}
    obj["top_5_processes"] = get_top_memory_processes()
    return obj

def get_top_memory_processes(limit=5):
    process_list = []
    for p in ps.process_iter(['pid', 'name', 'memory_percent', 'memory_info']):
        try:
            pinfo = p.info
            process_list.append({
                'pid': pinfo['pid'],
                'name': pinfo['name'],
                'percent': pinfo['memory_percent'] or 0.0,
                'rss_mb': round(pinfo['memory_info'].rss / (1024 * 1024), 2)
            })
        except (ps.NoSuchProcess, ps.AccessDenied, ps.ZombieProcess, AttributeError):
            continue
    sorted_processes = sorted(process_list, key=lambda x: x['percent'], reverse=True)
    return sorted_processes[:limit]

def bytes_to_gb(byte):
    return byte / 1024**3