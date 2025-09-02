/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: { input: any; output: any; }
  /**
   * The `GenericScalar` scalar type represents a generic
   * GraphQL scalar value that could be:
   * String, Boolean, Int, Float, List or Object.
   */
  GenericScalar: { input: any; output: any; }
  /**
   * Allows use of a JSON String for input / output from the GraphQL schema.
   *
   * Use of this type is *not recommended* as you lose the benefits of having a defined, static
   * schema (one of the key benefits of GraphQL).
   */
  JSONString: { input: any; output: any; }
};

export type AecsJobFilter = {
  /** Filter by arch */
  arch?: InputMaybe<Scalars['String']['input']>;
  /** Filter by firmware_id_list */
  firmware_id_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
};

export type AecsJobType = Node & {
  __typename?: 'AecsJobType';
  arch?: Maybe<Scalars['String']['output']>;
  firmwareIdList?: Maybe<AndroidFirmwareTypeConnection>;
  /** The ID of the object */
  id: Scalars['ID']['output'];
  pk?: Maybe<Scalars['String']['output']>;
};


export type AecsJobTypeFirmwareIdListArgs = {
  absoluteStorePath?: InputMaybe<Scalars['String']['input']>;
  aecsBuildFilePath?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  fileSizeBytes?: InputMaybe<Scalars['Float']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hasFileIndex?: InputMaybe<Scalars['Boolean']['input']>;
  hasFuzzyHashIndex?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  indexedDate?: InputMaybe<Scalars['DateTime']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  md5?: InputMaybe<Scalars['String']['input']>;
  originalFilename?: InputMaybe<Scalars['String']['input']>;
  osVendor?: InputMaybe<Scalars['String']['input']>;
  partitionInfoDict?: InputMaybe<Scalars['JSONString']['input']>;
  relativeStorePath?: InputMaybe<Scalars['String']['input']>;
  sha1?: InputMaybe<Scalars['String']['input']>;
  sha256?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  versionDetected?: InputMaybe<Scalars['Int']['input']>;
};

export type AndroGuardReportFilter = {
  /** Filter by activities */
  activities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by android_app_id_reference */
  android_app_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by android_version_code */
  android_version_code?: InputMaybe<Scalars['String']['input']>;
  /** Filter by android_version_name */
  android_version_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by app_name */
  app_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by class_analysis_id_list */
  class_analysis_id_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by dex_names */
  dex_names?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by effective_target_version */
  effective_target_version?: InputMaybe<Scalars['String']['input']>;
  /** Filter by file_name_list */
  file_name_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by intent_filters_dict */
  intent_filters_dict?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_androidtv */
  is_androidtv?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_leanback */
  is_leanback?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_multidex */
  is_multidex?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_signed_v1 */
  is_signed_v1?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_signed_v2 */
  is_signed_v2?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_signed_v3 */
  is_signed_v3?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_valid_APK */
  is_valid_APK?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_wearable */
  is_wearable?: InputMaybe<Scalars['String']['input']>;
  /** Filter by main_activity */
  main_activity?: InputMaybe<Scalars['String']['input']>;
  /** Filter by main_activity_list */
  main_activity_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by manifest_features */
  manifest_features?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by manifest_libraries */
  manifest_libraries?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by manifest_xml */
  manifest_xml?: InputMaybe<Scalars['String']['input']>;
  /** Filter by max_sdk_version */
  max_sdk_version?: InputMaybe<Scalars['String']['input']>;
  /** Filter by min_sdk_version */
  min_sdk_version?: InputMaybe<Scalars['String']['input']>;
  /** Filter by packagename */
  packagename?: InputMaybe<Scalars['String']['input']>;
  /** Filter by permission_details */
  permission_details?: InputMaybe<Scalars['String']['input']>;
  /** Filter by permissions */
  permissions?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by permissions_declared */
  permissions_declared?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by permissions_declared_details */
  permissions_declared_details?: InputMaybe<Scalars['String']['input']>;
  /** Filter by permissions_implied */
  permissions_implied?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by permissions_requested_third_party */
  permissions_requested_third_party?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by providers */
  providers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by receivers */
  receivers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_name */
  scanner_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_version */
  scanner_version?: InputMaybe<Scalars['String']['input']>;
  /** Filter by services */
  services?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by signature_names */
  signature_names?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by string_analysis_id_list */
  string_analysis_id_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by target_sdk_version */
  target_sdk_version?: InputMaybe<Scalars['String']['input']>;
};

export type AndroGuardReportType = Node & {
  __typename?: 'AndroGuardReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  activities?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  androidAppIdReference: AndroidAppType;
  androidVersionCode?: Maybe<Scalars['String']['output']>;
  androidVersionName?: Maybe<Scalars['String']['output']>;
  appName?: Maybe<Scalars['String']['output']>;
  dexNames?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  effectiveTargetVersion?: Maybe<Scalars['String']['output']>;
  fileNameList?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The ID of the object */
  id: Scalars['ID']['output'];
  intentFiltersDict?: Maybe<Scalars['JSONString']['output']>;
  isAndroidtv?: Maybe<Scalars['Boolean']['output']>;
  isLeanback?: Maybe<Scalars['Boolean']['output']>;
  isMultidex?: Maybe<Scalars['Boolean']['output']>;
  isSignedV1?: Maybe<Scalars['Boolean']['output']>;
  isSignedV2?: Maybe<Scalars['Boolean']['output']>;
  isSignedV3?: Maybe<Scalars['Boolean']['output']>;
  isValidApk?: Maybe<Scalars['Boolean']['output']>;
  isWearable?: Maybe<Scalars['Boolean']['output']>;
  mainActivity?: Maybe<Scalars['String']['output']>;
  mainActivityList?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  manifestFeatures?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  manifestLibraries?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  manifestXml?: Maybe<Scalars['String']['output']>;
  maxSdkVersion?: Maybe<Scalars['String']['output']>;
  minSdkVersion?: Maybe<Scalars['String']['output']>;
  packagename: Scalars['String']['output'];
  permissionDetails?: Maybe<Scalars['JSONString']['output']>;
  permissions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  permissionsDeclared?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  permissionsDeclaredDetails?: Maybe<Scalars['JSONString']['output']>;
  permissionsImplied?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  permissionsRequestedThirdParty?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  providers?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  receivers?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  reportDate: Scalars['DateTime']['output'];
  scannerName: Scalars['String']['output'];
  scannerVersion: Scalars['String']['output'];
  services?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  signatureNames?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  targetSdkVersion?: Maybe<Scalars['String']['output']>;
};

export type AndroidAppFilter = {
  /** Filter by absolute_store_path */
  absolute_store_path?: InputMaybe<Scalars['String']['input']>;
  /** Filter by androguard_report_reference */
  androguard_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by android_manifest_dict */
  android_manifest_dict?: InputMaybe<Scalars['JSONString']['input']>;
  /** Filter by androwarn_report_reference */
  androwarn_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by apkid_report_reference */
  apkid_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by apkleaks_report_reference */
  apkleaks_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by apkscan_report_reference */
  apkscan_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by app_twins_reference_list */
  app_twins_reference_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by certificate_id_list */
  certificate_id_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by exodus_report_reference */
  exodus_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by file_size_bytes */
  file_size_bytes?: InputMaybe<Scalars['String']['input']>;
  /** Filter by filename */
  filename?: InputMaybe<Scalars['String']['input']>;
  /** Filter by firmware_file_reference */
  firmware_file_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by firmware_id_reference */
  firmware_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by flowdroid_report_reference */
  flowdroid_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by generic_file_list */
  generic_file_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by indexed_date */
  indexed_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by md5 */
  md5?: InputMaybe<Scalars['String']['input']>;
  /** Filter by mobsfscan_report_reference */
  mobsfscan_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by opt_firmware_file_reference_list */
  opt_firmware_file_reference_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by original_filename */
  original_filename?: InputMaybe<Scalars['String']['input']>;
  /** Filter by packagename */
  packagename?: InputMaybe<Scalars['String']['input']>;
  /** Filter by partition_name */
  partition_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by qark_report_reference */
  qark_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by quark_engine_report_reference */
  quark_engine_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by relative_firmware_path */
  relative_firmware_path?: InputMaybe<Scalars['String']['input']>;
  /** Filter by relative_store_path */
  relative_store_path?: InputMaybe<Scalars['String']['input']>;
  /** Filter by sha1 */
  sha1?: InputMaybe<Scalars['String']['input']>;
  /** Filter by sha256 */
  sha256?: InputMaybe<Scalars['String']['input']>;
  /** Filter by super_report_reference */
  super_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by trueseeing_report_reference */
  trueseeing_report_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by virustotal_report_reference */
  virustotal_report_reference?: InputMaybe<Scalars['String']['input']>;
};

export type AndroidAppType = Node & {
  __typename?: 'AndroidAppType';
  absoluteStorePath?: Maybe<Scalars['String']['output']>;
  androguardReportReference?: Maybe<AndroGuardReportType>;
  androidManifestDict?: Maybe<Scalars['JSONString']['output']>;
  androwarnReportReference?: Maybe<AndrowarnReportType>;
  apkidReportReference?: Maybe<ApkidReportType>;
  apkleaksReportReference?: Maybe<ApkleaksReportType>;
  appTwinsReferenceList?: Maybe<AndroidAppTypeConnection>;
  certificateIdList?: Maybe<AppCertificateTypeConnection>;
  exodusReportReference?: Maybe<ExodusReportType>;
  fileSizeBytes: Scalars['Int']['output'];
  filename: Scalars['String']['output'];
  firmwareFileReference?: Maybe<FirmwareFileType>;
  firmwareIdReference?: Maybe<AndroidFirmwareType>;
  /** The ID of the object */
  id: Scalars['ID']['output'];
  indexedDate?: Maybe<Scalars['DateTime']['output']>;
  md5: Scalars['String']['output'];
  optFirmwareFileReferenceList?: Maybe<FirmwareFileTypeConnection>;
  originalFilename?: Maybe<Scalars['String']['output']>;
  packagename?: Maybe<Scalars['String']['output']>;
  partitionName?: Maybe<Scalars['String']['output']>;
  pk?: Maybe<Scalars['String']['output']>;
  qarkReportReference?: Maybe<QarkReportType>;
  quarkEngineReportReference?: Maybe<QuarkEngineReportType>;
  relativeFirmwarePath: Scalars['String']['output'];
  relativeStorePath?: Maybe<Scalars['String']['output']>;
  sha1: Scalars['String']['output'];
  sha256: Scalars['String']['output'];
  superReportReference?: Maybe<SuperReportType>;
  virustotalReportReference?: Maybe<VirustotalReportType>;
};


export type AndroidAppTypeAppTwinsReferenceListArgs = {
  absoluteStorePath?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  androguardReportReference?: InputMaybe<Scalars['ID']['input']>;
  androidManifestDict?: InputMaybe<Scalars['JSONString']['input']>;
  androwarnReportReference?: InputMaybe<Scalars['ID']['input']>;
  apkidReportReference?: InputMaybe<Scalars['ID']['input']>;
  apkleaksReportReference?: InputMaybe<Scalars['ID']['input']>;
  apkscanReportReference?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  exodusReportReference?: InputMaybe<Scalars['ID']['input']>;
  fileSizeBytes?: InputMaybe<Scalars['Int']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  firmwareFileReference?: InputMaybe<Scalars['ID']['input']>;
  firmwareIdReference?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  flowdroidReportReference?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  indexedDate?: InputMaybe<Scalars['DateTime']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  md5?: InputMaybe<Scalars['String']['input']>;
  mobsfscanReportReference?: InputMaybe<Scalars['ID']['input']>;
  originalFilename?: InputMaybe<Scalars['String']['input']>;
  packagename?: InputMaybe<Scalars['String']['input']>;
  partitionName?: InputMaybe<Scalars['String']['input']>;
  qarkReportReference?: InputMaybe<Scalars['ID']['input']>;
  quarkEngineReportReference?: InputMaybe<Scalars['ID']['input']>;
  relativeFirmwarePath?: InputMaybe<Scalars['String']['input']>;
  relativeStorePath?: InputMaybe<Scalars['String']['input']>;
  sha1?: InputMaybe<Scalars['String']['input']>;
  sha256?: InputMaybe<Scalars['String']['input']>;
  superReportReference?: InputMaybe<Scalars['ID']['input']>;
  trueseeingReportReference?: InputMaybe<Scalars['ID']['input']>;
  virustotalReportReference?: InputMaybe<Scalars['ID']['input']>;
};


export type AndroidAppTypeCertificateIdListArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  androidAppIdReference?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  crlDistributionPointsList?: InputMaybe<Scalars['String']['input']>;
  deltaCrlDistributionPointsList?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hashAlgo?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  isCa?: InputMaybe<Scalars['Boolean']['input']>;
  isSelfIssued?: InputMaybe<Scalars['Boolean']['input']>;
  isSelfSignedStr?: InputMaybe<Scalars['String']['input']>;
  isValidDomainIp?: InputMaybe<Scalars['Boolean']['input']>;
  issuer?: InputMaybe<Scalars['String']['input']>;
  issuerDict?: InputMaybe<Scalars['JSONString']['input']>;
  issuerSerial?: InputMaybe<Scalars['String']['input']>;
  keyIdentifier?: InputMaybe<Scalars['String']['input']>;
  keyIdentifierValue?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  maxPathLengthInt?: InputMaybe<Scalars['Int']['input']>;
  notValidAfter?: InputMaybe<Scalars['DateTime']['input']>;
  notValidBefore?: InputMaybe<Scalars['DateTime']['input']>;
  ocspUrlsList?: InputMaybe<Scalars['String']['input']>;
  publicKeyAlgorithm?: InputMaybe<Scalars['String']['input']>;
  publicKeyBitSize?: InputMaybe<Scalars['String']['input']>;
  publicKeyByteSize?: InputMaybe<Scalars['String']['input']>;
  publicKeyCurve?: InputMaybe<Scalars['String']['input']>;
  publicKeyExponent?: InputMaybe<Scalars['Int']['input']>;
  publicKeyHashAlgoDsa?: InputMaybe<Scalars['String']['input']>;
  publicKeyModulusN?: InputMaybe<Scalars['String']['input']>;
  publicKeySha1?: InputMaybe<Scalars['String']['input']>;
  publicKeySha256?: InputMaybe<Scalars['String']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  sha1?: InputMaybe<Scalars['String']['input']>;
  sha256?: InputMaybe<Scalars['String']['input']>;
  signature?: InputMaybe<Scalars['String']['input']>;
  signatureAlgo?: InputMaybe<Scalars['String']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  subjectDict?: InputMaybe<Scalars['JSONString']['input']>;
  validDomainsList?: InputMaybe<Scalars['String']['input']>;
  validIpsList?: InputMaybe<Scalars['String']['input']>;
};


export type AndroidAppTypeOptFirmwareFileReferenceListArgs = {
  absoluteStorePath?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  androidAppReference?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  fileSizeBytes?: InputMaybe<Scalars['Int']['input']>;
  firmwareIdReference?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  indexedDate?: InputMaybe<Scalars['DateTime']['input']>;
  isDirectory?: InputMaybe<Scalars['Boolean']['input']>;
  isOnDisk?: InputMaybe<Scalars['Boolean']['input']>;
  isSymlink?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  md5?: InputMaybe<Scalars['String']['input']>;
  metaDict?: InputMaybe<Scalars['JSONString']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentDir?: InputMaybe<Scalars['String']['input']>;
  partitionName?: InputMaybe<Scalars['String']['input']>;
  relativePath?: InputMaybe<Scalars['String']['input']>;
  sdhashReference?: InputMaybe<Scalars['ID']['input']>;
  ssdeepReference?: InputMaybe<Scalars['ID']['input']>;
  tlshReference?: InputMaybe<Scalars['ID']['input']>;
};

export type AndroidAppTypeConnection = {
  __typename?: 'AndroidAppTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<AndroidAppTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `AndroidAppType` and its cursor. */
export type AndroidAppTypeEdge = {
  __typename?: 'AndroidAppTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<AndroidAppType>;
};

export type AndroidFirmwareConnection = {
  __typename?: 'AndroidFirmwareConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<AndroidFirmwareEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `AndroidFirmware` and its cursor. */
export type AndroidFirmwareEdge = {
  __typename?: 'AndroidFirmwareEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<AndroidFirmwareType>;
};

export type AndroidFirmwareFilter = {
  /** Filter by absolute_store_path */
  absolute_store_path?: InputMaybe<Scalars['String']['input']>;
  /** Filter by aecs_build_file_path */
  aecs_build_file_path?: InputMaybe<Scalars['String']['input']>;
  /** Filter by android_app_id_list */
  android_app_id_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by build_prop_file_id_list */
  build_prop_file_id_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by file_size_bytes */
  file_size_bytes?: InputMaybe<Scalars['String']['input']>;
  /** Filter by filename */
  filename?: InputMaybe<Scalars['String']['input']>;
  /** Filter by firmware_file_id_list */
  firmware_file_id_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by has_file_index */
  has_file_index?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by has_fuzzy_hash_index */
  has_fuzzy_hash_index?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by indexed_date */
  indexed_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by md5 */
  md5?: InputMaybe<Scalars['String']['input']>;
  /** Filter by original_filename */
  original_filename?: InputMaybe<Scalars['String']['input']>;
  /** Filter by os_vendor */
  os_vendor?: InputMaybe<Scalars['String']['input']>;
  /** Filter by partition_info_dict */
  partition_info_dict?: InputMaybe<Scalars['JSONString']['input']>;
  /** Filter by relative_store_path */
  relative_store_path?: InputMaybe<Scalars['String']['input']>;
  /** Filter by sha1 */
  sha1?: InputMaybe<Scalars['String']['input']>;
  /** Filter by sha256 */
  sha256?: InputMaybe<Scalars['String']['input']>;
  /** Filter by tag */
  tag?: InputMaybe<Scalars['String']['input']>;
  /** Filter by version_detected */
  version_detected?: InputMaybe<Scalars['Int']['input']>;
};

export type AndroidFirmwareType = Node & {
  __typename?: 'AndroidFirmwareType';
  absoluteStorePath: Scalars['String']['output'];
  aecsBuildFilePath?: Maybe<Scalars['String']['output']>;
  androidAppIdList?: Maybe<AndroidAppTypeConnection>;
  buildPropFileIdList?: Maybe<BuildPropFileTypeConnection>;
  fileSizeBytes?: Maybe<Scalars['Float']['output']>;
  filename: Scalars['String']['output'];
  firmwareFileIdList?: Maybe<FirmwareFileTypeConnection>;
  hasFileIndex?: Maybe<Scalars['Boolean']['output']>;
  hasFuzzyHashIndex?: Maybe<Scalars['Boolean']['output']>;
  /** The ID of the object */
  id: Scalars['ID']['output'];
  indexedDate?: Maybe<Scalars['DateTime']['output']>;
  md5: Scalars['String']['output'];
  originalFilename: Scalars['String']['output'];
  osVendor: Scalars['String']['output'];
  partitionInfoDict?: Maybe<Scalars['JSONString']['output']>;
  pk?: Maybe<Scalars['String']['output']>;
  relativeStorePath: Scalars['String']['output'];
  sha1: Scalars['String']['output'];
  sha256: Scalars['String']['output'];
  tag?: Maybe<Scalars['String']['output']>;
  versionDetected?: Maybe<Scalars['Int']['output']>;
};


export type AndroidFirmwareTypeAndroidAppIdListArgs = {
  absoluteStorePath?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  androguardReportReference?: InputMaybe<Scalars['ID']['input']>;
  androidManifestDict?: InputMaybe<Scalars['JSONString']['input']>;
  androwarnReportReference?: InputMaybe<Scalars['ID']['input']>;
  apkidReportReference?: InputMaybe<Scalars['ID']['input']>;
  apkleaksReportReference?: InputMaybe<Scalars['ID']['input']>;
  apkscanReportReference?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  exodusReportReference?: InputMaybe<Scalars['ID']['input']>;
  fileSizeBytes?: InputMaybe<Scalars['Int']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  firmwareFileReference?: InputMaybe<Scalars['ID']['input']>;
  firmwareIdReference?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  flowdroidReportReference?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  indexedDate?: InputMaybe<Scalars['DateTime']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  md5?: InputMaybe<Scalars['String']['input']>;
  mobsfscanReportReference?: InputMaybe<Scalars['ID']['input']>;
  originalFilename?: InputMaybe<Scalars['String']['input']>;
  packagename?: InputMaybe<Scalars['String']['input']>;
  partitionName?: InputMaybe<Scalars['String']['input']>;
  qarkReportReference?: InputMaybe<Scalars['ID']['input']>;
  quarkEngineReportReference?: InputMaybe<Scalars['ID']['input']>;
  relativeFirmwarePath?: InputMaybe<Scalars['String']['input']>;
  relativeStorePath?: InputMaybe<Scalars['String']['input']>;
  sha1?: InputMaybe<Scalars['String']['input']>;
  sha256?: InputMaybe<Scalars['String']['input']>;
  superReportReference?: InputMaybe<Scalars['ID']['input']>;
  trueseeingReportReference?: InputMaybe<Scalars['ID']['input']>;
  virustotalReportReference?: InputMaybe<Scalars['ID']['input']>;
};


export type AndroidFirmwareTypeBuildPropFileIdListArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  firmwareFileIdReference?: InputMaybe<Scalars['ID']['input']>;
  firmwareIdReference?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  properties?: InputMaybe<Scalars['JSONString']['input']>;
};


export type AndroidFirmwareTypeFirmwareFileIdListArgs = {
  absoluteStorePath?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  androidAppReference?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  fileSizeBytes?: InputMaybe<Scalars['Int']['input']>;
  firmwareIdReference?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  indexedDate?: InputMaybe<Scalars['DateTime']['input']>;
  isDirectory?: InputMaybe<Scalars['Boolean']['input']>;
  isOnDisk?: InputMaybe<Scalars['Boolean']['input']>;
  isSymlink?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  md5?: InputMaybe<Scalars['String']['input']>;
  metaDict?: InputMaybe<Scalars['JSONString']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentDir?: InputMaybe<Scalars['String']['input']>;
  partitionName?: InputMaybe<Scalars['String']['input']>;
  relativePath?: InputMaybe<Scalars['String']['input']>;
  sdhashReference?: InputMaybe<Scalars['ID']['input']>;
  ssdeepReference?: InputMaybe<Scalars['ID']['input']>;
  tlshReference?: InputMaybe<Scalars['ID']['input']>;
};

export type AndroidFirmwareTypeConnection = {
  __typename?: 'AndroidFirmwareTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<AndroidFirmwareTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `AndroidFirmwareType` and its cursor. */
export type AndroidFirmwareTypeEdge = {
  __typename?: 'AndroidFirmwareTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<AndroidFirmwareType>;
};

export type AndrowarnReportFilter = {
  /** Filter by PIM_data_leakage */
  PIM_data_leakage?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by android_app_id_reference */
  android_app_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by audio_video_eavesdropping */
  audio_video_eavesdropping?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by code_execution */
  code_execution?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by connection_interfaces_exfiltration */
  connection_interfaces_exfiltration?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by device_settings_harvesting */
  device_settings_harvesting?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by location_lookup */
  location_lookup?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_file_json */
  report_file_json?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_name */
  scanner_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_version */
  scanner_version?: InputMaybe<Scalars['String']['input']>;
  /** Filter by suspicious_connection_establishment */
  suspicious_connection_establishment?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by telephony_identifiers_leakage */
  telephony_identifiers_leakage?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by telephony_services_abuse */
  telephony_services_abuse?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type AndrowarnReportType = {
  __typename?: 'AndrowarnReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  PIMDataLeakage?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  androidAppIdReference: AndroidAppType;
  audioVideoEavesdropping?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  codeExecution?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  connectionInterfacesExfiltration?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  deviceSettingsHarvesting?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  locationLookup?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  reportDate: Scalars['DateTime']['output'];
  reportFileJson: FileFieldType;
  scannerName: Scalars['String']['output'];
  scannerVersion: Scalars['String']['output'];
  suspiciousConnectionEstablishment?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  telephonyIdentifiersLeakage?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  telephonyServicesAbuse?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type ApkScannerReportFilter = {
  /** Filter by android_app_id_reference */
  android_app_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_name */
  scanner_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_version */
  scanner_version?: InputMaybe<Scalars['String']['input']>;
};

export type ApkScannerReportType = {
  __typename?: 'ApkScannerReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppIdReference: AndroidAppType;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportDate: Scalars['DateTime']['output'];
  scannerName: Scalars['String']['output'];
  scannerVersion: Scalars['String']['output'];
};

export type ApkidReportFilter = {
  /** Filter by android_app_id_reference */
  android_app_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by files */
  files?: InputMaybe<Array<InputMaybe<Scalars['JSONString']['input']>>>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_file_json */
  report_file_json?: InputMaybe<Scalars['String']['input']>;
  /** Filter by rules_sha256 */
  rules_sha256?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_name */
  scanner_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_version */
  scanner_version?: InputMaybe<Scalars['String']['input']>;
};

export type ApkidReportType = {
  __typename?: 'ApkidReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppIdReference: AndroidAppType;
  files?: Maybe<Array<Maybe<Scalars['JSONString']['output']>>>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportDate: Scalars['DateTime']['output'];
  reportFileJson: FileFieldType;
  rulesSha256?: Maybe<Scalars['String']['output']>;
  scannerName: Scalars['String']['output'];
  scannerVersion: Scalars['String']['output'];
};

export type ApkleaksReportFilter = {
  /** Filter by android_app_id_reference */
  android_app_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by results */
  results?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_name */
  scanner_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_version */
  scanner_version?: InputMaybe<Scalars['String']['input']>;
};

export type ApkleaksReportType = {
  __typename?: 'ApkleaksReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppIdReference: AndroidAppType;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportDate: Scalars['DateTime']['output'];
  results: Scalars['JSONString']['output'];
  scannerName: Scalars['String']['output'];
  scannerVersion: Scalars['String']['output'];
};

export type ApkleaksStatisticsReportFilter = {
  /** Filter by android_app_count */
  android_app_count?: InputMaybe<Scalars['String']['input']>;
  /** Filter by android_app_reference_file */
  android_app_reference_file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by google_api_keys_references */
  google_api_keys_references?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by leaks_count_dict */
  leaks_count_dict?: InputMaybe<Scalars['String']['input']>;
  /** Filter by leaks_reference_dict */
  leaks_reference_dict?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_count */
  report_count?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_name */
  report_name?: InputMaybe<Scalars['String']['input']>;
};

export type ApkleaksStatisticsReportType = {
  __typename?: 'ApkleaksStatisticsReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppCount: Scalars['Int']['output'];
  androidAppReferenceFile?: Maybe<JsonFileType>;
  googleApiKeysReferences?: Maybe<JsonFileType>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  leaksCountDict?: Maybe<Scalars['JSONString']['output']>;
  leaksReferenceDict?: Maybe<JsonFileType>;
  reportCount: Scalars['Int']['output'];
  reportDate: Scalars['DateTime']['output'];
  reportName: Scalars['String']['output'];
};

export type AppCertificateFilter = {
  /** Filter by android_app_id_reference */
  android_app_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by crl_distribution_points_list */
  crl_distribution_points_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by delta_crl_distribution_points_list */
  delta_crl_distribution_points_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by generic_file_list */
  generic_file_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by hash_algo */
  hash_algo?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_ca */
  is_ca?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_self_issued */
  is_self_issued?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_self_signed_str */
  is_self_signed_str?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_valid_domain_ip */
  is_valid_domain_ip?: InputMaybe<Scalars['String']['input']>;
  /** Filter by issuer */
  issuer?: InputMaybe<Scalars['String']['input']>;
  /** Filter by issuer_dict */
  issuer_dict?: InputMaybe<Scalars['String']['input']>;
  /** Filter by issuer_serial */
  issuer_serial?: InputMaybe<Scalars['String']['input']>;
  /** Filter by key_identifier */
  key_identifier?: InputMaybe<Scalars['String']['input']>;
  /** Filter by key_identifier_value */
  key_identifier_value?: InputMaybe<Scalars['String']['input']>;
  /** Filter by max_path_length_int */
  max_path_length_int?: InputMaybe<Scalars['String']['input']>;
  /** Filter by not_valid_after */
  not_valid_after?: InputMaybe<Scalars['String']['input']>;
  /** Filter by not_valid_before */
  not_valid_before?: InputMaybe<Scalars['String']['input']>;
  /** Filter by ocsp_urls_list */
  ocsp_urls_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by public_key_algorithm */
  public_key_algorithm?: InputMaybe<Scalars['String']['input']>;
  /** Filter by public_key_bit_size */
  public_key_bit_size?: InputMaybe<Scalars['String']['input']>;
  /** Filter by public_key_byte_size */
  public_key_byte_size?: InputMaybe<Scalars['String']['input']>;
  /** Filter by public_key_curve */
  public_key_curve?: InputMaybe<Scalars['String']['input']>;
  /** Filter by public_key_exponent */
  public_key_exponent?: InputMaybe<Scalars['String']['input']>;
  /** Filter by public_key_hash_algo_dsa */
  public_key_hash_algo_dsa?: InputMaybe<Scalars['String']['input']>;
  /** Filter by public_key_modulus_n */
  public_key_modulus_n?: InputMaybe<Scalars['String']['input']>;
  /** Filter by public_key_sha1 */
  public_key_sha1?: InputMaybe<Scalars['String']['input']>;
  /** Filter by public_key_sha256 */
  public_key_sha256?: InputMaybe<Scalars['String']['input']>;
  /** Filter by serial_number */
  serial_number?: InputMaybe<Scalars['String']['input']>;
  /** Filter by sha1 */
  sha1?: InputMaybe<Scalars['String']['input']>;
  /** Filter by sha256 */
  sha256?: InputMaybe<Scalars['String']['input']>;
  /** Filter by signature */
  signature?: InputMaybe<Scalars['String']['input']>;
  /** Filter by signature_algo */
  signature_algo?: InputMaybe<Scalars['String']['input']>;
  /** Filter by subject */
  subject?: InputMaybe<Scalars['String']['input']>;
  /** Filter by subject_dict */
  subject_dict?: InputMaybe<Scalars['String']['input']>;
  /** Filter by valid_domains_list */
  valid_domains_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by valid_ips_list */
  valid_ips_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type AppCertificateType = Node & {
  __typename?: 'AppCertificateType';
  androidAppIdReference: AndroidAppType;
  crlDistributionPointsList?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  deltaCrlDistributionPointsList?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  hashAlgo?: Maybe<Scalars['String']['output']>;
  /** The ID of the object */
  id: Scalars['ID']['output'];
  isCa?: Maybe<Scalars['Boolean']['output']>;
  isSelfIssued?: Maybe<Scalars['Boolean']['output']>;
  isSelfSignedStr?: Maybe<Scalars['String']['output']>;
  isValidDomainIp?: Maybe<Scalars['Boolean']['output']>;
  issuer: Scalars['String']['output'];
  issuerDict?: Maybe<Scalars['JSONString']['output']>;
  issuerSerial?: Maybe<Scalars['String']['output']>;
  keyIdentifier?: Maybe<Scalars['String']['output']>;
  keyIdentifierValue?: Maybe<Scalars['String']['output']>;
  maxPathLengthInt?: Maybe<Scalars['Int']['output']>;
  notValidAfter: Scalars['DateTime']['output'];
  notValidBefore: Scalars['DateTime']['output'];
  ocspUrlsList?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  publicKeyAlgorithm?: Maybe<Scalars['String']['output']>;
  publicKeyBitSize?: Maybe<Scalars['String']['output']>;
  publicKeyByteSize?: Maybe<Scalars['String']['output']>;
  publicKeyCurve?: Maybe<Scalars['String']['output']>;
  publicKeyExponent?: Maybe<Scalars['Int']['output']>;
  publicKeyHashAlgoDsa?: Maybe<Scalars['String']['output']>;
  publicKeyModulusN?: Maybe<Scalars['String']['output']>;
  publicKeySha1?: Maybe<Scalars['String']['output']>;
  publicKeySha256?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  sha1: Scalars['String']['output'];
  sha256: Scalars['String']['output'];
  signature?: Maybe<Scalars['String']['output']>;
  signatureAlgo?: Maybe<Scalars['String']['output']>;
  subject: Scalars['String']['output'];
  subjectDict?: Maybe<Scalars['JSONString']['output']>;
  validDomainsList?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  validIpsList?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type AppCertificateTypeConnection = {
  __typename?: 'AppCertificateTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<AppCertificateTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `AppCertificateType` and its cursor. */
export type AppCertificateTypeEdge = {
  __typename?: 'AppCertificateTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<AppCertificateType>;
};

export type BuildPropFileType = Node & {
  __typename?: 'BuildPropFileType';
  firmwareFileIdReference: FirmwareFileType;
  firmwareIdReference?: Maybe<AndroidFirmwareType>;
  /** The ID of the object */
  id: Scalars['ID']['output'];
  pk?: Maybe<Scalars['String']['output']>;
  properties: Scalars['JSONString']['output'];
  propertyKeys?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  propertyValues?: Maybe<Scalars['JSONString']['output']>;
};

export type BuildPropFileTypeConnection = {
  __typename?: 'BuildPropFileTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<BuildPropFileTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `BuildPropFileType` and its cursor. */
export type BuildPropFileTypeEdge = {
  __typename?: 'BuildPropFileTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<BuildPropFileType>;
};

/**
 * Starts the service to create app build files ("Android.mk" or "Android.bp") for specific firmware. These build
 * files can be used in the Android Open Source Project to create custom firmware that includes the specific apk files.
 */
export type CreateAecsBuildFilesJob = {
  __typename?: 'CreateAECSBuildFilesJob';
  jobIdList?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

/**
 * Create a RQ job for modules that scan apk files (static-analysis). Only module names from the class:'ModuleNames'
 * are accepted. Every module uses an own python interpreter and the module is loaded during runtime.
 */
export type CreateApkScanJob = {
  __typename?: 'CreateApkScanJob';
  jobIdList?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type CreateAppImportJob = {
  __typename?: 'CreateAppImportJob';
  jobId?: Maybe<Scalars['String']['output']>;
};

/**
 * Starts the firmware extractor module. The extractor module is used to import firmware from the "firmware_import"
 * directory to the database. Only one instance of the extractor module is allowed to run.
 */
export type CreateFirmwareExtractorJob = {
  __typename?: 'CreateFirmwareExtractorJob';
  jobId?: Maybe<Scalars['String']['output']>;
};

/**
 * First, copies the firmware into the importer queue. Second, deletes the firmware from the database and runs
 * the importer.
 */
export type CreateFirmwareReImportJob = {
  __typename?: 'CreateFirmwareReImportJob';
  jobId?: Maybe<Scalars['String']['output']>;
};

/**
 * Starts the fuzzy hasher module. The fuzzy hasher module is used to create fuzzy hashes for all firmware files in
 * the given firmware list.
 */
export type CreateFuzzyHashesJob = {
  __typename?: 'CreateFuzzyHashesJob';
  jobId?: Maybe<Scalars['String']['output']>;
};

export type CreateVirusTotalScanJob = {
  __typename?: 'CreateVirusTotalScanJob';
  jobIdList?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

/** Deletes the aecs-job from the database. */
export type DeleteAecsJob = {
  __typename?: 'DeleteAecsJob';
  isSuccess?: Maybe<Scalars['Boolean']['output']>;
};

export type DeleteAndroidFirmwareMutation = {
  __typename?: 'DeleteAndroidFirmwareMutation';
  jobId?: Maybe<Scalars['String']['output']>;
};

export type DeleteJsonWebTokenCookie = {
  __typename?: 'DeleteJSONWebTokenCookie';
  deleted: Scalars['Boolean']['output'];
};

export type DeleteRefreshTokenCookie = {
  __typename?: 'DeleteRefreshTokenCookie';
  deleted: Scalars['Boolean']['output'];
};

/** Debugging information for the current query. */
export type DjangoDebug = {
  __typename?: 'DjangoDebug';
  /** Raise exceptions for this API query. */
  exceptions?: Maybe<Array<Maybe<DjangoDebugException>>>;
  /** Executed SQL queries for this API query. */
  sql?: Maybe<Array<Maybe<DjangoDebugSql>>>;
};

/** Represents a single exception raised. */
export type DjangoDebugException = {
  __typename?: 'DjangoDebugException';
  /** The class of the exception */
  excType: Scalars['String']['output'];
  /** The message of the exception */
  message: Scalars['String']['output'];
  /** The stack trace */
  stack: Scalars['String']['output'];
};

/** Represents a single database query made to a Django managed DB. */
export type DjangoDebugSql = {
  __typename?: 'DjangoDebugSQL';
  /** The Django database alias (e.g. 'default'). */
  alias: Scalars['String']['output'];
  /** Duration of this database query in seconds. */
  duration: Scalars['Float']['output'];
  /** Postgres connection encoding if available. */
  encoding?: Maybe<Scalars['String']['output']>;
  /** Whether this database query was a SELECT. */
  isSelect: Scalars['Boolean']['output'];
  /** Whether this database query took more than 10 seconds. */
  isSlow: Scalars['Boolean']['output'];
  /** Postgres isolation level if available. */
  isoLevel?: Maybe<Scalars['String']['output']>;
  /** JSON encoded database query parameters. */
  params: Scalars['String']['output'];
  /** The raw SQL of this query, without params. */
  rawSql: Scalars['String']['output'];
  /** The actual SQL sent to this database. */
  sql?: Maybe<Scalars['String']['output']>;
  /** Start time of this database query. */
  startTime: Scalars['Float']['output'];
  /** Stop time of this database query. */
  stopTime: Scalars['Float']['output'];
  /** Postgres transaction ID if available. */
  transId?: Maybe<Scalars['String']['output']>;
  /** Postgres transaction status if available. */
  transStatus?: Maybe<Scalars['String']['output']>;
  /** The type of database being used (e.g. postrgesql, mysql, sqlite). */
  vendor: Scalars['String']['output'];
};

export type ExodusReportFilter = {
  /** Filter by android_app_id_reference */
  android_app_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by results */
  results?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_name */
  scanner_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_version */
  scanner_version?: InputMaybe<Scalars['String']['input']>;
};

export type ExodusReportType = {
  __typename?: 'ExodusReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppIdReference: AndroidAppType;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportDate: Scalars['DateTime']['output'];
  results: Scalars['JSONString']['output'];
  scannerName: Scalars['String']['output'];
  scannerVersion: Scalars['String']['output'];
};

export type ExodusStatisticsReportFilter = {
  /** Filter by android_app_count */
  android_app_count?: InputMaybe<Scalars['String']['input']>;
  /** Filter by android_app_reference_file */
  android_app_reference_file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by number_of_apps_with_no_trackers */
  number_of_apps_with_no_trackers?: InputMaybe<Scalars['String']['input']>;
  /** Filter by number_of_apps_with_trackers */
  number_of_apps_with_trackers?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_count */
  report_count?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_name */
  report_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by tracker_count_dict */
  tracker_count_dict?: InputMaybe<Scalars['String']['input']>;
};

export type ExodusStatisticsReportType = {
  __typename?: 'ExodusStatisticsReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppCount: Scalars['Int']['output'];
  androidAppReferenceFile?: Maybe<JsonFileType>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  numberOfAppsWithNoTrackers?: Maybe<Scalars['Int']['output']>;
  numberOfAppsWithTrackers?: Maybe<Scalars['Int']['output']>;
  reportCount: Scalars['Int']['output'];
  reportDate: Scalars['DateTime']['output'];
  reportName: Scalars['String']['output'];
  trackerCountDict?: Maybe<Scalars['JSONString']['output']>;
};

export type ExportFirmwareFileByRegexMutation = {
  __typename?: 'ExportFirmwareFileByRegexMutation';
  jobId?: Maybe<Scalars['String']['output']>;
};

export type ExtendedBuildPropFileFilter = {
  /** Filter by build_prop_file */
  build_prop_file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by firmware_file_id_reference */
  firmware_file_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by firmware_id_reference */
  firmware_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by properties */
  properties?: InputMaybe<Scalars['String']['input']>;
  /** Filter by property keys */
  propertyKeys?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by property values */
  propertyValues?: InputMaybe<Array<InputMaybe<Scalars['GenericScalar']['input']>>>;
};

export type FileFieldType = {
  __typename?: 'FileFieldType';
  chunkSize?: Maybe<Scalars['Int']['output']>;
  contentType?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  length?: Maybe<Scalars['Int']['output']>;
  md5?: Maybe<Scalars['String']['output']>;
};

export type FirmwareFileFilter = {
  /** Filter by absolute_store_path */
  absolute_store_path?: InputMaybe<Scalars['String']['input']>;
  /** Filter by android_app_reference */
  android_app_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by file_size_bytes */
  file_size_bytes?: InputMaybe<Scalars['String']['input']>;
  /** Filter by firmware_id_reference */
  firmware_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by indexed_date */
  indexed_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_directory */
  is_directory?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_on_disk */
  is_on_disk?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_symlink */
  is_symlink?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by md5 */
  md5?: InputMaybe<Scalars['String']['input']>;
  /** Filter by meta_dict */
  meta_dict?: InputMaybe<Scalars['JSONString']['input']>;
  /** Filter by name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by parent_dir */
  parent_dir?: InputMaybe<Scalars['String']['input']>;
  /** Filter by partition_name */
  partition_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by relative_path */
  relative_path?: InputMaybe<Scalars['String']['input']>;
  /** Filter by sdhash_reference */
  sdhash_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by ssdeep_reference */
  ssdeep_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by tlsh_reference */
  tlsh_reference?: InputMaybe<Scalars['String']['input']>;
};

export type FirmwareFileType = Node & {
  __typename?: 'FirmwareFileType';
  absoluteStorePath: Scalars['String']['output'];
  androidAppReference?: Maybe<AndroidAppType>;
  fileSizeBytes?: Maybe<Scalars['Int']['output']>;
  firmwareIdReference?: Maybe<AndroidFirmwareType>;
  /** The ID of the object */
  id: Scalars['ID']['output'];
  indexedDate?: Maybe<Scalars['DateTime']['output']>;
  isDirectory: Scalars['Boolean']['output'];
  isOnDisk?: Maybe<Scalars['Boolean']['output']>;
  isSymlink?: Maybe<Scalars['Boolean']['output']>;
  md5?: Maybe<Scalars['String']['output']>;
  metaDict?: Maybe<Scalars['JSONString']['output']>;
  name: Scalars['String']['output'];
  parentDir: Scalars['String']['output'];
  partitionName?: Maybe<Scalars['String']['output']>;
  relativePath: Scalars['String']['output'];
  tlshReference?: Maybe<TlshHashType>;
};

export type FirmwareFileTypeConnection = {
  __typename?: 'FirmwareFileTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<FirmwareFileTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `FirmwareFileType` and its cursor. */
export type FirmwareFileTypeEdge = {
  __typename?: 'FirmwareFileTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<FirmwareFileType>;
};

export type FirmwareImporterSettingType = {
  __typename?: 'FirmwareImporterSettingType';
  createDate?: Maybe<Scalars['DateTime']['output']>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  numberOfImporterThreads: Scalars['Int']['output'];
};

export type ImageFileFilter = {
  /** Filter by file */
  file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by file_type */
  file_type?: InputMaybe<Scalars['String']['input']>;
  /** Filter by filename */
  filename?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by save_date */
  save_date?: InputMaybe<Scalars['String']['input']>;
};

export type ImageFileType = {
  __typename?: 'ImageFileType';
  file: FileFieldType;
  fileType: Scalars['String']['output'];
  filename: Scalars['String']['output'];
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  saveDate: Scalars['DateTime']['output'];
};

export type JsonFileFilter = {
  /** Filter by file */
  file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
};

export type JsonFileType = {
  __typename?: 'JsonFileType';
  file: FileFieldType;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportDate: Scalars['DateTime']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _debug?: Maybe<DjangoDebug>;
  /**
   * Starts the service to create app build files ("Android.mk" or "Android.bp") for specific firmware. These build
   * files can be used in the Android Open Source Project to create custom firmware that includes the specific apk files.
   */
  createAecsBuildFilesJob?: Maybe<CreateAecsBuildFilesJob>;
  /**
   * Create a RQ job for modules that scan apk files (static-analysis). Only module names from the class:'ModuleNames'
   * are accepted. Every module uses an own python interpreter and the module is loaded during runtime.
   */
  createApkScanJob?: Maybe<CreateApkScanJob>;
  createAppImportJob?: Maybe<CreateAppImportJob>;
  /**
   * Starts the firmware extractor module. The extractor module is used to import firmware from the "firmware_import"
   * directory to the database. Only one instance of the extractor module is allowed to run.
   */
  createFirmwareExtractorJob?: Maybe<CreateFirmwareExtractorJob>;
  /**
   * First, copies the firmware into the importer queue. Second, deletes the firmware from the database and runs
   * the importer.
   */
  createFirmwareReImportJob?: Maybe<CreateFirmwareReImportJob>;
  /**
   * Starts the fuzzy hasher module. The fuzzy hasher module is used to create fuzzy hashes for all firmware files in
   * the given firmware list.
   */
  createFuzzyHashesJob?: Maybe<CreateFuzzyHashesJob>;
  createVirustotalScanJob?: Maybe<CreateVirusTotalScanJob>;
  /** Deletes the aecs-job from the database. */
  deleteAecsJob?: Maybe<DeleteAecsJob>;
  deleteAndroidFirmware?: Maybe<DeleteAndroidFirmwareMutation>;
  deleteRefreshTokenCookie?: Maybe<DeleteRefreshTokenCookie>;
  deleteTokenCookie?: Maybe<DeleteJsonWebTokenCookie>;
  exportFirmwareFile?: Maybe<ExportFirmwareFileByRegexMutation>;
  updateFirmwareImporterSetting?: Maybe<UpdateFirmwareImportSetting>;
  /**
   * Create or update the aecs-job. There can only be one aecs-job in the database. In case a new
   * job is created the old will be overwritten by the new. The aecs-job is used to store a
   * list of firmware ids for further processing by the aecs-service.
   */
  updateOrCreateAecsJob?: Maybe<UpdateOrCreateAecsJob>;
};


export type MutationCreateAecsBuildFilesJobArgs = {
  firmwareIdList?: InputMaybe<Array<Scalars['String']['input']>>;
  formatName: Scalars['String']['input'];
  queueName?: Scalars['String']['input'];
  skipFileExport?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationCreateApkScanJobArgs = {
  firmwareIdList?: InputMaybe<Array<Scalars['String']['input']>>;
  kwargs?: Scalars['JSONString']['input'];
  moduleName: Scalars['String']['input'];
  objectIdList?: InputMaybe<Array<Scalars['String']['input']>>;
  queueName?: Scalars['String']['input'];
};


export type MutationCreateAppImportJobArgs = {
  queueName?: Scalars['String']['input'];
  storageIndex?: Scalars['Int']['input'];
};


export type MutationCreateFirmwareExtractorJobArgs = {
  createFuzzyHashes: Scalars['Boolean']['input'];
  queueName?: Scalars['String']['input'];
  storageIndex?: Scalars['Int']['input'];
};


export type MutationCreateFirmwareReImportJobArgs = {
  createFuzzyHashes?: InputMaybe<Scalars['Boolean']['input']>;
  firmwareIdList: Array<Scalars['String']['input']>;
  queueName?: Scalars['String']['input'];
};


export type MutationCreateFuzzyHashesJobArgs = {
  firmwareIdList?: InputMaybe<Array<Scalars['String']['input']>>;
  queueName?: Scalars['String']['input'];
  storageIndex?: Scalars['Int']['input'];
};


export type MutationCreateVirustotalScanJobArgs = {
  objectIdList: Array<Scalars['String']['input']>;
  queueName?: Scalars['String']['input'];
  vtApiKey: Scalars['String']['input'];
};


export type MutationDeleteAecsJobArgs = {
  acesJobIdList: Array<Scalars['String']['input']>;
};


export type MutationDeleteAndroidFirmwareArgs = {
  firmwareIdList: Array<Scalars['String']['input']>;
  queueName?: Scalars['String']['input'];
};


export type MutationExportFirmwareFileArgs = {
  filenameRegex: Scalars['String']['input'];
  firmwareIdList: Array<Scalars['String']['input']>;
  queueName?: Scalars['String']['input'];
  storeSettingId: Scalars['String']['input'];
};


export type MutationUpdateFirmwareImporterSettingArgs = {
  numberOfImporterThreads?: Scalars['Int']['input'];
  queueName?: Scalars['String']['input'];
};


export type MutationUpdateOrCreateAecsJobArgs = {
  acesJobId?: InputMaybe<Scalars['String']['input']>;
  arch?: InputMaybe<Scalars['String']['input']>;
  firmwareIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  queueName?: InputMaybe<Scalars['String']['input']>;
};

/** An object with an ID */
export type Node = {
  /** The ID of the object */
  id: Scalars['ID']['output'];
};

/** Obtain JSON Web Token mutation */
export type ObtainJsonWebToken = {
  __typename?: 'ObtainJSONWebToken';
  payload: Scalars['GenericScalar']['output'];
  refreshExpiresIn: Scalars['Int']['output'];
  token: Scalars['String']['output'];
};

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type QarkReportFilter = {
  /** Filter by android_app_id_reference */
  android_app_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by issue_list */
  issue_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_file_json */
  report_file_json?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_name */
  scanner_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_version */
  scanner_version?: InputMaybe<Scalars['String']['input']>;
};

export type QarkReportType = {
  __typename?: 'QarkReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppIdReference: AndroidAppType;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportDate: Scalars['DateTime']['output'];
  reportFileJson: FileFieldType;
  scannerName: Scalars['String']['output'];
  scannerVersion: Scalars['String']['output'];
};

export type QuarkEngineReportFilter = {
  /** Filter by android_app_id_reference */
  android_app_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by results */
  results?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_name */
  scanner_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_version */
  scanner_version?: InputMaybe<Scalars['String']['input']>;
};

export type QuarkEngineReportType = {
  __typename?: 'QuarkEngineReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppIdReference: AndroidAppType;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportDate: Scalars['DateTime']['output'];
  results: Scalars['JSONString']['output'];
  scannerName: Scalars['String']['output'];
  scannerVersion: Scalars['String']['output'];
};

export type QuarkEngineStatisticsReportFilter = {
  /** Filter by android_app_count */
  android_app_count?: InputMaybe<Scalars['String']['input']>;
  /** Filter by android_app_reference_file */
  android_app_reference_file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_count */
  report_count?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_name */
  report_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by threat_level_count_dict */
  threat_level_count_dict?: InputMaybe<Scalars['String']['input']>;
  /** Filter by threat_level_reference_dict */
  threat_level_reference_dict?: InputMaybe<Scalars['String']['input']>;
};

export type QuarkEngineStatisticsReportType = {
  __typename?: 'QuarkEngineStatisticsReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppCount: Scalars['Int']['output'];
  androidAppReferenceFile?: Maybe<JsonFileType>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportCount: Scalars['Int']['output'];
  reportDate: Scalars['DateTime']['output'];
  reportName: Scalars['String']['output'];
  threatLevelCountDict?: Maybe<Scalars['JSONString']['output']>;
  threatLevelReferenceDict?: Maybe<JsonFileType>;
};

export type Query = {
  __typename?: 'Query';
  _debug?: Maybe<DjangoDebug>;
  aecs_job_list?: Maybe<Array<Maybe<AecsJobType>>>;
  androguard_report_list?: Maybe<Array<Maybe<AndroGuardReportType>>>;
  android_app_id_list?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  android_app_list?: Maybe<Array<Maybe<AndroidAppType>>>;
  android_firmware_connection?: Maybe<AndroidFirmwareConnection>;
  android_firmware_id_list?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  android_firmware_list?: Maybe<Array<Maybe<AndroidFirmwareType>>>;
  androwarn_report_list?: Maybe<Array<Maybe<AndrowarnReportType>>>;
  apk_scanner_report_list?: Maybe<Array<Maybe<ApkScannerReportType>>>;
  apkid_report_list?: Maybe<Array<Maybe<ApkidReportType>>>;
  apkleaks_report_list?: Maybe<Array<Maybe<ApkleaksReportType>>>;
  apkleaks_statistics_report_list?: Maybe<Array<Maybe<ApkleaksStatisticsReportType>>>;
  app_certificate_list?: Maybe<Array<Maybe<AppCertificateType>>>;
  build_prop_file_id_list?: Maybe<Array<Maybe<BuildPropFileType>>>;
  exodus_report_list?: Maybe<Array<Maybe<ExodusReportType>>>;
  exodus_statistics_report_list?: Maybe<Array<Maybe<ExodusStatisticsReportType>>>;
  firmware_file_list?: Maybe<Array<Maybe<FirmwareFileType>>>;
  firmware_importer_setting_list?: Maybe<Array<Maybe<FirmwareImporterSettingType>>>;
  image_file_list?: Maybe<Array<Maybe<ImageFileType>>>;
  isApiUp?: Maybe<Scalars['Boolean']['output']>;
  json_file_list?: Maybe<Array<Maybe<JsonFileType>>>;
  me?: Maybe<UserType>;
  qark_report_list?: Maybe<Array<Maybe<QarkReportType>>>;
  quark_engine_report_list?: Maybe<Array<Maybe<QuarkEngineReportType>>>;
  quark_engine_statistics_report_list?: Maybe<Array<Maybe<QuarkEngineStatisticsReportType>>>;
  refreshToken?: Maybe<Refresh>;
  rq_job?: Maybe<RqJobType>;
  rq_job_list?: Maybe<Array<Maybe<RqJobType>>>;
  rq_queue_name_list?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  scanner_module_name_list?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  ssdeep_cluster_analysis_list?: Maybe<Array<Maybe<SsDeepClusterAnalysisType>>>;
  statistics_report_list?: Maybe<Array<Maybe<StatisticsReportType>>>;
  store_settings_list?: Maybe<Array<Maybe<StoreSettingsType>>>;
  super_report_list?: Maybe<Array<Maybe<SuperReportType>>>;
  super_statistics_report_list?: Maybe<Array<Maybe<SuperStatisticsReportType>>>;
  tlsh_hash_list?: Maybe<Array<Maybe<TlshHashType>>>;
  /** Obtain JSON Web Token mutation */
  tokenAuth?: Maybe<ObtainJsonWebToken>;
  users?: Maybe<Array<Maybe<UserType>>>;
  verifyToken?: Maybe<Verify>;
  virustotal_report_list?: Maybe<Array<Maybe<VirustotalReportType>>>;
  webclient_setting_list?: Maybe<Array<Maybe<WebclientSettingType>>>;
};


export type QueryAecs_Job_ListArgs = {
  fieldFilter?: InputMaybe<AecsJobFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryAndroguard_Report_ListArgs = {
  fieldFilter?: InputMaybe<AndroGuardReportFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryAndroid_App_Id_ListArgs = {
  fieldFilter?: InputMaybe<AndroidAppFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryAndroid_App_ListArgs = {
  fieldFilter?: InputMaybe<AndroidAppFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryAndroid_Firmware_ConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  fieldFilter?: InputMaybe<AndroidFirmwareFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryAndroid_Firmware_Id_ListArgs = {
  fieldFilter?: InputMaybe<AndroidFirmwareFilter>;
};


export type QueryAndroid_Firmware_ListArgs = {
  fieldFilter?: InputMaybe<AndroidFirmwareFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryAndrowarn_Report_ListArgs = {
  fieldFilter?: InputMaybe<AndrowarnReportFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryApk_Scanner_Report_ListArgs = {
  fieldFilter?: InputMaybe<ApkScannerReportFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryApkid_Report_ListArgs = {
  fieldFilter?: InputMaybe<ApkidReportFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryApkleaks_Report_ListArgs = {
  fieldFilter?: InputMaybe<ApkleaksReportFilter>;
  objectId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryApkleaks_Statistics_Report_ListArgs = {
  fieldFilter?: InputMaybe<ApkleaksStatisticsReportFilter>;
  objectId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryApp_Certificate_ListArgs = {
  fieldFilter?: InputMaybe<AppCertificateFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryBuild_Prop_File_Id_ListArgs = {
  fieldFilter?: InputMaybe<ExtendedBuildPropFileFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryExodus_Report_ListArgs = {
  fieldFilter?: InputMaybe<ExodusReportFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryExodus_Statistics_Report_ListArgs = {
  fieldFilter?: InputMaybe<ExodusStatisticsReportFilter>;
  objectId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryFirmware_File_ListArgs = {
  fieldFilter?: InputMaybe<FirmwareFileFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryImage_File_ListArgs = {
  fieldFilter?: InputMaybe<ImageFileFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryJson_File_ListArgs = {
  fieldFilter?: InputMaybe<JsonFileFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryQark_Report_ListArgs = {
  fieldFilter?: InputMaybe<QarkReportFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryQuark_Engine_Report_ListArgs = {
  fieldFilter?: InputMaybe<QuarkEngineReportFilter>;
  objectId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryQuark_Engine_Statistics_Report_ListArgs = {
  fieldFilter?: InputMaybe<QuarkEngineStatisticsReportFilter>;
  objectId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryRefreshTokenArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRq_JobArgs = {
  jobId: Scalars['String']['input'];
  queueName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRq_Job_ListArgs = {
  jobIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  queueName?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySsdeep_Cluster_Analysis_ListArgs = {
  fieldFilter?: InputMaybe<SsDeepClusterAnalysisFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryStatistics_Report_ListArgs = {
  fieldFilter?: InputMaybe<StatisticsReportFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryStore_Settings_ListArgs = {
  fieldFilter?: InputMaybe<StoreSettingFilter>;
};


export type QuerySuper_Report_ListArgs = {
  fieldFilter?: InputMaybe<SuperReportFilter>;
  objectId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QuerySuper_Statistics_Report_ListArgs = {
  fieldFilter?: InputMaybe<SuperStatisticsReportFilter>;
  objectId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryTlsh_Hash_ListArgs = {
  fieldFilter?: InputMaybe<TlshHashFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryTokenAuthArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type QueryVerifyTokenArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVirustotal_Report_ListArgs = {
  fieldFilter?: InputMaybe<VirusTotalReportFilter>;
  objectIdList?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type Refresh = {
  __typename?: 'Refresh';
  payload: Scalars['GenericScalar']['output'];
  refreshExpiresIn: Scalars['Int']['output'];
  token: Scalars['String']['output'];
};

/** GraphQL type representing an RQ job */
export type RqJobType = {
  __typename?: 'RqJobType';
  /** When the job was created */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** Description of the job function */
  description?: Maybe<Scalars['String']['output']>;
  /** When the job finished */
  endedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Exception information if job failed */
  excInfo?: Maybe<Scalars['String']['output']>;
  /** Name of the function being executed */
  funcName?: Maybe<Scalars['String']['output']>;
  /** Unique job identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** Whether the job has failed */
  isFailed?: Maybe<Scalars['Boolean']['output']>;
  /** Whether the job has finished */
  isFinished?: Maybe<Scalars['Boolean']['output']>;
  /** Name of the queue the job belongs to */
  queueName?: Maybe<Scalars['String']['output']>;
  /** String representation of job result */
  result?: Maybe<Scalars['String']['output']>;
  /** When the job started executing */
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Job status (queued, started, finished, failed, etc.) */
  status?: Maybe<Scalars['String']['output']>;
  /** Job timeout in seconds */
  timeout?: Maybe<Scalars['Int']['output']>;
};

export type SsDeepClusterAnalysisFilter = {
  /** Filter by cluster_list */
  cluster_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Filter by cluster_list_file */
  cluster_list_file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by gexf_file */
  gexf_file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by matches_dict */
  matches_dict?: InputMaybe<Scalars['String']['input']>;
  /** Filter by matches_dict_file */
  matches_dict_file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scores_dict */
  scores_dict?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scores_dict_file */
  scores_dict_file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by ssdeep_hash_count */
  ssdeep_hash_count?: InputMaybe<Scalars['String']['input']>;
  /** Filter by ssdeep_hash_reference_file */
  ssdeep_hash_reference_file?: InputMaybe<Scalars['String']['input']>;
};

export type SsDeepClusterAnalysisType = {
  __typename?: 'SsDeepClusterAnalysisType';
  clusterList?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  clusterListFile: FileFieldType;
  gexfFile: FileFieldType;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  matchesDict?: Maybe<Scalars['JSONString']['output']>;
  matchesDictFile: FileFieldType;
  scoresDict?: Maybe<Scalars['JSONString']['output']>;
  scoresDictFile: FileFieldType;
  ssdeepHashCount: Scalars['Int']['output'];
  ssdeepHashReferenceFile: JsonFileType;
};

export type StatisticsReportFilter = {
  /** Filter by android_app_count */
  android_app_count?: InputMaybe<Scalars['String']['input']>;
  /** Filter by android_app_reference_file */
  android_app_reference_file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_count */
  report_count?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_name */
  report_name?: InputMaybe<Scalars['String']['input']>;
};

export type StatisticsReportType = {
  __typename?: 'StatisticsReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppCount: Scalars['Int']['output'];
  androidAppReferenceFile?: Maybe<JsonFileType>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportCount: Scalars['Int']['output'];
  reportDate: Scalars['DateTime']['output'];
  reportName: Scalars['String']['output'];
};

export type StoreSettingFilter = {
  /** Filter by create_date */
  create_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by is_active */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by server_setting_reference */
  server_setting_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by storage_root */
  storage_root?: InputMaybe<Scalars['String']['input']>;
  /** Filter by store_options_dict */
  store_options_dict?: InputMaybe<Scalars['String']['input']>;
  /** Filter by uuid */
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type StoreSettingsType = {
  __typename?: 'StoreSettingsType';
  createDate?: Maybe<Scalars['DateTime']['output']>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  isActive: Scalars['Boolean']['output'];
  storageRoot: Scalars['String']['output'];
  storeOptionsDict: Scalars['JSONString']['output'];
  uuid: Scalars['String']['output'];
};

export type SuperReportFilter = {
  /** Filter by android_app_id_reference */
  android_app_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by results */
  results?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_name */
  scanner_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_version */
  scanner_version?: InputMaybe<Scalars['String']['input']>;
};

export type SuperReportType = {
  __typename?: 'SuperReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppIdReference: AndroidAppType;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportDate: Scalars['DateTime']['output'];
  results: Scalars['JSONString']['output'];
  scannerName: Scalars['String']['output'];
  scannerVersion: Scalars['String']['output'];
};

export type SuperStatisticsReportFilter = {
  /** Filter by android_app_count */
  android_app_count?: InputMaybe<Scalars['String']['input']>;
  /** Filter by android_app_reference_file */
  android_app_reference_file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_count */
  report_count?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_name */
  report_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by vulnerabilities_by_category_count_dict */
  vulnerabilities_by_category_count_dict?: InputMaybe<Scalars['String']['input']>;
  /** Filter by vulnerabilities_count_dict */
  vulnerabilities_count_dict?: InputMaybe<Scalars['String']['input']>;
  /** Filter by vulnerabilities_high_crit_references_file */
  vulnerabilities_high_crit_references_file?: InputMaybe<Scalars['String']['input']>;
  /** Filter by vulnerabilities_high_crit_unique_app_count */
  vulnerabilities_high_crit_unique_app_count?: InputMaybe<Scalars['Int']['input']>;
};

export type SuperStatisticsReportType = {
  __typename?: 'SuperStatisticsReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  androidAppCount: Scalars['Int']['output'];
  androidAppReferenceFile?: Maybe<JsonFileType>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportCount: Scalars['Int']['output'];
  reportDate: Scalars['DateTime']['output'];
  reportName: Scalars['String']['output'];
  vulnerabilitiesByCategoryCountDict?: Maybe<Scalars['JSONString']['output']>;
  vulnerabilitiesCountDict?: Maybe<Scalars['JSONString']['output']>;
  vulnerabilitiesHighCritReferencesFile?: Maybe<JsonFileType>;
  vulnerabilitiesHighCritUniqueAppCount?: Maybe<Scalars['Int']['output']>;
};

export type TlshHashFilter = {
  /** Filter by digest */
  digest?: InputMaybe<Scalars['String']['input']>;
  /** Filter by filename */
  filename?: InputMaybe<Scalars['String']['input']>;
  /** Filter by firmware_file_reference */
  firmware_file_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by firmware_id_reference */
  firmware_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
};

export type TlshHashType = {
  __typename?: 'TlshHashType';
  digest: Scalars['String']['output'];
  filename?: Maybe<Scalars['String']['output']>;
  firmwareFileReference: FirmwareFileType;
  firmwareIdReference?: Maybe<AndroidFirmwareType>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
};

export type UpdateFirmwareImportSetting = {
  __typename?: 'UpdateFirmwareImportSetting';
  jobId?: Maybe<Scalars['String']['output']>;
};

/**
 * Create or update the aecs-job. There can only be one aecs-job in the database. In case a new
 * job is created the old will be overwritten by the new. The aecs-job is used to store a
 * list of firmware ids for further processing by the aecs-service.
 */
export type UpdateOrCreateAecsJob = {
  __typename?: 'UpdateOrCreateAECSJob';
  jobId?: Maybe<Scalars['String']['output']>;
};

export type UserType = {
  __typename?: 'UserType';
  dateJoined: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Designates whether this user should be treated as active. Unselect this instead of deleting accounts. */
  isActive: Scalars['Boolean']['output'];
  /** Designates whether the user can log into this admin site. */
  isStaff: Scalars['Boolean']['output'];
  /** Designates that this user has all permissions without explicitly assigning them. */
  isSuperuser: Scalars['Boolean']['output'];
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  lastName: Scalars['String']['output'];
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: Scalars['String']['output'];
};

export type Verify = {
  __typename?: 'Verify';
  payload: Scalars['GenericScalar']['output'];
};

export type VirusTotalReportFilter = {
  /** Filter by analysis_id */
  analysis_id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by android_app_id_reference */
  android_app_id_reference?: InputMaybe<Scalars['String']['input']>;
  /** Filter by file_info */
  file_info?: InputMaybe<Scalars['String']['input']>;
  /** Filter by id */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Filter by report_date */
  report_date?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_name */
  scanner_name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scanner_version */
  scanner_version?: InputMaybe<Scalars['String']['input']>;
  /** Filter by virus_total_analysis */
  virus_total_analysis?: InputMaybe<Scalars['String']['input']>;
};

export type VirustotalReportType = {
  __typename?: 'VirustotalReportType';
  Cls?: Maybe<Scalars['String']['output']>;
  analysisId?: Maybe<Scalars['String']['output']>;
  androidAppIdReference: AndroidAppType;
  fileInfo?: Maybe<Scalars['JSONString']['output']>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  reportDate: Scalars['DateTime']['output'];
  scannerName: Scalars['String']['output'];
  scannerVersion: Scalars['String']['output'];
  virusTotalAnalysis?: Maybe<Scalars['String']['output']>;
};

export type WebclientSettingType = {
  __typename?: 'WebclientSettingType';
  activeScannersDict: Scalars['JSONString']['output'];
  createDate?: Maybe<Scalars['DateTime']['output']>;
  /** _id */
  id?: Maybe<Scalars['ID']['output']>;
  isFirmwareUploadActive: Scalars['Boolean']['output'];
  isSignupActive: Scalars['Boolean']['output'];
};

export type GetApiHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApiHealthQuery = { __typename?: 'Query', isApiUp?: boolean | null };

export type GetApkObjectIdsByFirmwareObjectIdsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApkObjectIdsByFirmwareObjectIdsQuery = { __typename?: 'Query', android_app_id_list?: Array<string | null> | null };

export type AppTableRowScannerFragment = { __typename?: 'AndroidAppType', id: string } & { ' $fragmentName'?: 'AppTableRowScannerFragment' };

export type GetAppsByObjectIdsScannerQueryVariables = Exact<{
  objectIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetAppsByObjectIdsScannerQuery = { __typename?: 'Query', android_app_list?: Array<(
    { __typename?: 'AndroidAppType' }
    & { ' $fragmentRefs'?: { 'AppTableRowScannerFragment': AppTableRowScannerFragment } }
  ) | null> | null };

export type CreateApkScanJobMutationVariables = Exact<{
  objectIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
  scannerName: Scalars['String']['input'];
}>;


export type CreateApkScanJobMutation = { __typename?: 'Mutation', createApkScanJob?: { __typename?: 'CreateApkScanJob', jobIdList?: Array<string | null> | null } | null };

export type GetAuthTokenQueryVariables = Exact<{
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
}>;


export type GetAuthTokenQuery = { __typename?: 'Query', tokenAuth?: { __typename?: 'ObtainJSONWebToken', token: string } | null };

export type DeleteTokenCookieMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteTokenCookieMutation = { __typename?: 'Mutation', deleteTokenCookie?: { __typename?: 'DeleteJSONWebTokenCookie', deleted: boolean } | null };

export type GetCurrentUserIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserIdQuery = { __typename?: 'Query', me?: { __typename?: 'UserType', id: string } | null };

export type GetCurrentUserEmailAndUsernameQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserEmailAndUsernameQuery = { __typename?: 'Query', me?: { __typename?: 'UserType', email: string, username: string } | null };

export type CreateFirmwareExtractorJobMutationVariables = Exact<{
  storageIndex: Scalars['Int']['input'];
}>;


export type CreateFirmwareExtractorJobMutation = { __typename?: 'Mutation', createFirmwareExtractorJob?: { __typename?: 'CreateFirmwareExtractorJob', jobId?: string | null } | null };

export type GetFirmwareObjectIdListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFirmwareObjectIdListQuery = { __typename?: 'Query', android_firmware_id_list?: Array<string | null> | null };

export type FirmwareTableRowFragment = { __typename?: 'AndroidFirmwareType', id: string, absoluteStorePath: string, aecsBuildFilePath?: string | null, filename: string, hasFileIndex?: boolean | null, hasFuzzyHashIndex?: boolean | null, indexedDate?: any | null, md5: string, originalFilename: string, osVendor: string, relativeStorePath: string, sha1: string, sha256: string, tag?: string | null, versionDetected?: number | null, pk?: string | null } & { ' $fragmentName'?: 'FirmwareTableRowFragment' };

export type GetFirmwaresByObjectIdsQueryVariables = Exact<{
  objectIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetFirmwaresByObjectIdsQuery = { __typename?: 'Query', android_firmware_list?: Array<(
    { __typename?: 'AndroidFirmwareType' }
    & { ' $fragmentRefs'?: { 'FirmwareTableRowFragment': FirmwareTableRowFragment } }
  ) | null> | null };

export type FirmwareTableRowImporterFragment = { __typename?: 'AndroidFirmwareType', id: string, indexedDate?: any | null, originalFilename: string, osVendor: string, versionDetected?: number | null } & { ' $fragmentName'?: 'FirmwareTableRowImporterFragment' };

export type GetFirmwaresByObjectIdsImporterQueryVariables = Exact<{
  objectIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetFirmwaresByObjectIdsImporterQuery = { __typename?: 'Query', android_firmware_list?: Array<(
    { __typename?: 'AndroidFirmwareType' }
    & { ' $fragmentRefs'?: { 'FirmwareTableRowImporterFragment': FirmwareTableRowImporterFragment } }
  ) | null> | null };

export type FirmwareTableRowScannerFragment = { __typename?: 'AndroidFirmwareType', id: string, originalFilename: string } & { ' $fragmentName'?: 'FirmwareTableRowScannerFragment' };

export type GetFirmwaresByObjectIdsScannerQueryVariables = Exact<{
  objectIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetFirmwaresByObjectIdsScannerQuery = { __typename?: 'Query', android_firmware_list?: Array<(
    { __typename?: 'AndroidFirmwareType' }
    & { ' $fragmentRefs'?: { 'FirmwareTableRowScannerFragment': FirmwareTableRowScannerFragment } }
  ) | null> | null };

export type DeleteFirmwareByObjectIdMutationVariables = Exact<{
  objectIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type DeleteFirmwareByObjectIdMutation = { __typename?: 'Mutation', deleteAndroidFirmware?: { __typename?: 'DeleteAndroidFirmwareMutation', jobId?: string | null } | null };

export const AppTableRowScannerFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AppTableRowScanner"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndroidAppType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]} as unknown as DocumentNode<AppTableRowScannerFragment, unknown>;
export const FirmwareTableRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FirmwareTableRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndroidFirmwareType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"absoluteStorePath"}},{"kind":"Field","name":{"kind":"Name","value":"aecsBuildFilePath"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"hasFileIndex"}},{"kind":"Field","name":{"kind":"Name","value":"hasFuzzyHashIndex"}},{"kind":"Field","name":{"kind":"Name","value":"indexedDate"}},{"kind":"Field","name":{"kind":"Name","value":"md5"}},{"kind":"Field","name":{"kind":"Name","value":"originalFilename"}},{"kind":"Field","name":{"kind":"Name","value":"osVendor"}},{"kind":"Field","name":{"kind":"Name","value":"relativeStorePath"}},{"kind":"Field","name":{"kind":"Name","value":"sha1"}},{"kind":"Field","name":{"kind":"Name","value":"sha256"}},{"kind":"Field","name":{"kind":"Name","value":"tag"}},{"kind":"Field","name":{"kind":"Name","value":"versionDetected"}},{"kind":"Field","name":{"kind":"Name","value":"pk"}}]}}]} as unknown as DocumentNode<FirmwareTableRowFragment, unknown>;
export const FirmwareTableRowImporterFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FirmwareTableRowImporter"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndroidFirmwareType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"indexedDate"}},{"kind":"Field","name":{"kind":"Name","value":"originalFilename"}},{"kind":"Field","name":{"kind":"Name","value":"osVendor"}},{"kind":"Field","name":{"kind":"Name","value":"versionDetected"}}]}}]} as unknown as DocumentNode<FirmwareTableRowImporterFragment, unknown>;
export const FirmwareTableRowScannerFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FirmwareTableRowScanner"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndroidFirmwareType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"originalFilename"}}]}}]} as unknown as DocumentNode<FirmwareTableRowScannerFragment, unknown>;
export const GetApiHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetApiHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isApiUp"}}]}}]} as unknown as DocumentNode<GetApiHealthQuery, GetApiHealthQueryVariables>;
export const GetApkObjectIdsByFirmwareObjectIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetApkObjectIdsByFirmwareObjectIds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"android_app_id_list"}}]}}]} as unknown as DocumentNode<GetApkObjectIdsByFirmwareObjectIdsQuery, GetApkObjectIdsByFirmwareObjectIdsQueryVariables>;
export const GetAppsByObjectIdsScannerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAppsByObjectIdsScanner"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"android_app_list"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"objectIdList"},"value":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AppTableRowScanner"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AppTableRowScanner"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndroidAppType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]} as unknown as DocumentNode<GetAppsByObjectIdsScannerQuery, GetAppsByObjectIdsScannerQueryVariables>;
export const CreateApkScanJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateApkScanJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scannerName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createApkScanJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"moduleName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scannerName"}}},{"kind":"Argument","name":{"kind":"Name","value":"objectIdList"},"value":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"queueName"},"value":{"kind":"StringValue","value":"high-python","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobIdList"}}]}}]}}]} as unknown as DocumentNode<CreateApkScanJobMutation, CreateApkScanJobMutationVariables>;
export const GetAuthTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAuthToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tokenAuth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}},{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]} as unknown as DocumentNode<GetAuthTokenQuery, GetAuthTokenQueryVariables>;
export const DeleteTokenCookieDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTokenCookie"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTokenCookie"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleted"}}]}}]}}]} as unknown as DocumentNode<DeleteTokenCookieMutation, DeleteTokenCookieMutationVariables>;
export const GetCurrentUserIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCurrentUserId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetCurrentUserIdQuery, GetCurrentUserIdQueryVariables>;
export const GetCurrentUserEmailAndUsernameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCurrentUserEmailAndUsername"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]} as unknown as DocumentNode<GetCurrentUserEmailAndUsernameQuery, GetCurrentUserEmailAndUsernameQueryVariables>;
export const CreateFirmwareExtractorJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFirmwareExtractorJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storageIndex"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFirmwareExtractorJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"createFuzzyHashes"},"value":{"kind":"BooleanValue","value":false}},{"kind":"Argument","name":{"kind":"Name","value":"queueName"},"value":{"kind":"StringValue","value":"high-python","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"storageIndex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storageIndex"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}}]}}]}}]} as unknown as DocumentNode<CreateFirmwareExtractorJobMutation, CreateFirmwareExtractorJobMutationVariables>;
export const GetFirmwareObjectIdListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFirmwareObjectIdList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"android_firmware_id_list"}}]}}]} as unknown as DocumentNode<GetFirmwareObjectIdListQuery, GetFirmwareObjectIdListQueryVariables>;
export const GetFirmwaresByObjectIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFirmwaresByObjectIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"android_firmware_list"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"objectIdList"},"value":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FirmwareTableRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FirmwareTableRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndroidFirmwareType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"absoluteStorePath"}},{"kind":"Field","name":{"kind":"Name","value":"aecsBuildFilePath"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"hasFileIndex"}},{"kind":"Field","name":{"kind":"Name","value":"hasFuzzyHashIndex"}},{"kind":"Field","name":{"kind":"Name","value":"indexedDate"}},{"kind":"Field","name":{"kind":"Name","value":"md5"}},{"kind":"Field","name":{"kind":"Name","value":"originalFilename"}},{"kind":"Field","name":{"kind":"Name","value":"osVendor"}},{"kind":"Field","name":{"kind":"Name","value":"relativeStorePath"}},{"kind":"Field","name":{"kind":"Name","value":"sha1"}},{"kind":"Field","name":{"kind":"Name","value":"sha256"}},{"kind":"Field","name":{"kind":"Name","value":"tag"}},{"kind":"Field","name":{"kind":"Name","value":"versionDetected"}},{"kind":"Field","name":{"kind":"Name","value":"pk"}}]}}]} as unknown as DocumentNode<GetFirmwaresByObjectIdsQuery, GetFirmwaresByObjectIdsQueryVariables>;
export const GetFirmwaresByObjectIdsImporterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFirmwaresByObjectIdsImporter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"android_firmware_list"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"objectIdList"},"value":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FirmwareTableRowImporter"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FirmwareTableRowImporter"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndroidFirmwareType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"indexedDate"}},{"kind":"Field","name":{"kind":"Name","value":"originalFilename"}},{"kind":"Field","name":{"kind":"Name","value":"osVendor"}},{"kind":"Field","name":{"kind":"Name","value":"versionDetected"}}]}}]} as unknown as DocumentNode<GetFirmwaresByObjectIdsImporterQuery, GetFirmwaresByObjectIdsImporterQueryVariables>;
export const GetFirmwaresByObjectIdsScannerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFirmwaresByObjectIdsScanner"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"android_firmware_list"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"objectIdList"},"value":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FirmwareTableRowScanner"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FirmwareTableRowScanner"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndroidFirmwareType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"originalFilename"}}]}}]} as unknown as DocumentNode<GetFirmwaresByObjectIdsScannerQuery, GetFirmwaresByObjectIdsScannerQueryVariables>;
export const DeleteFirmwareByObjectIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFirmwareByObjectId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAndroidFirmware"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"firmwareIdList"},"value":{"kind":"Variable","name":{"kind":"Name","value":"objectIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}}]}}]}}]} as unknown as DocumentNode<DeleteFirmwareByObjectIdMutation, DeleteFirmwareByObjectIdMutationVariables>;