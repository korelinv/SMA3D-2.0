using System.Collections.Generic;

namespace SMA.globals {

    public static class globals {

        public static string authEndpoint = "http://localhost:8050/endpoints";

        public static string proxy = "";
        public static string snapshotsSource = "";
        public static string datasetSource = "";

        public static void SetSources(Dictionary<string, object> config) {
            if (config.ContainsKey("proxy")) proxy = (string)config["proxy"];
            if (config.ContainsKey("snapshots")) snapshotsSource = (string)config["snapshots"];
            if (config.ContainsKey("datasources")) datasetSource = (string)config["datasources"];
        }
    }

}
