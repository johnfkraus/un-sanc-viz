
var re = /(<p>In accordance with paragraph.*?sanctions list\.<\/p>)/gmi;
var str = '<!-- http://www.un.org/sc/committees/751/SOi001.html --><p>In accordance with paragraph 14 of resolution 1844 (2008), the Security Council Committee pursuant to resolution 751 (1992) and 1907 (2009) concerning Somalia and Eritrea makes accessible a narrative summary of reasons for the listing for individuals and entities included on the 1844 Sanctions List.</p> <p><strong>SOi.001 YASIN ALI BAYNAH</strong></p> <p><em>Date on which the narrative summary became available on</em> <em>the Committee&rsquo;s website</em>: 29 October 2014</p> <p>Yasin Ali Baynah was listed on 12 April 2010 pursuant to paragraph 8 of resolution 1844 (2008).</p> <p><br> <em>Additional information</em></p> <p>Yasin Ali Baynah has incited attacks against the Transitional Federal Government (TFG) and the African Union Mission in Somalia (AMISOM). He has also mobilized support and raised funds on behalf of the Alliance for the Re-Liberation of Somalia and Hisbul Islam, both of which have actively engaged in acts that threaten the peace and security of Somalia, including rejection of the Djibouti Agreement, and attacks on the TFG and AMISOM forces in Mogadishu.</p> <h2> </h2>      <p>  </p>';
var subst = '';

var result = str.replace(re, subst);

console.log(result);