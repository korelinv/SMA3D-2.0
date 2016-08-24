using UnityEngine;
using System.Collections;
using System;

namespace SMA.system {

    /// <summary>
    /// Загрузчик данных через проки
    /// </summary>
    public class proxyLoader {

        //вспомогательные методы
        private static object[] Merge(WWW result, object[] parameters) {
            object[] resultArray = new object[parameters.Length + 1];
            resultArray[0] = result;
            Array.Copy(parameters, 0, resultArray, 1, parameters.Length);
            return resultArray;
        }
        private static IEnumerator Loading(string proxyUrl, string Url, WWWDelegate result, object[] parameters) {
            string proxy = proxyUrl;
            if (string.IsNullOrEmpty(proxy))
                proxy = DefaultProxyUrl;
            WWW loadingResult = new WWW(proxy + WWW.EscapeURL(Url));
            yield return loadingResult;
            if (parameters != null)
                result(Merge(loadingResult, parameters));
            else
                result(new object[] { loadingResult });
        }

        //API
        /// <summary>
        /// Ссылка на прокси используемая по умолчанию
        /// </summary>
        public static string DefaultProxyUrl = "";
        /// <summary>
        /// делегат для действи после окончания загрузки
        /// </summary>
        /// <param name="parameters">набор данных, parameters[0] всегда экземпляр WWW класса с результатом загрузки</param>
        public delegate void WWWDelegate(object[] parameters);
        /// <summary>
        /// Загрузка содержимого через прокси
        /// </summary>
        /// <param name="Url">ссылка</param>
        /// <param name="result">действие после выполнения загрузки</param>
        /// <returns></returns>
        public static IEnumerator Load(string Url, WWWDelegate result) {
            return Loading(null, Url, result, null);
        }
        /// <summary>
        /// Загрузка содержимого через прокси
        /// </summary>
        /// <param name="Url">ссылка</param>
        /// <param name="result">действие после выполнения загрузки</param>
        /// <param name="parameters">дополнительные параметры</param>
        /// <returns></returns>
        public static IEnumerator Load(string Url, WWWDelegate result, object[] parameters) {
            return Loading(null, Url, result, parameters);
        }
        /// <summary>
        /// Загрузка содержимого через прокси
        /// </summary>
        /// <param name="proxyUrl">ссылка на прокси</param>
        /// <param name="Url">ссылка</param>
        /// <param name="result">действие после выполнения загрузки</param>
        /// <returns></returns>
        public static IEnumerator Load(string proxyUrl, string Url, WWWDelegate result) {
            return Loading(proxyUrl, Url, result, null);
        }
        /// <summary>
        /// Загрузка содержимого через прокси
        /// </summary>
        /// <param name="proxyUrl">ссылка на прокси</param>
        /// <param name="Url">ссылка</param>
        /// <param name="result">действие после выполнения загрузки</param>
        /// <param name="parameters">дополнительные параметры</param>
        /// <returns></returns>
        public static IEnumerator Load(string proxyUrl, string Url, WWWDelegate result, object[] parameters) {
            return Loading(proxyUrl, Url, result, parameters);
        }

    }

}
