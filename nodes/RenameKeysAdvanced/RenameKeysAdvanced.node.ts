import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

import { get, set, unset, pick } from 'lodash';
import { options } from 'rhea';

interface IRenameKey {
	currentKey: string;
	newKey: string;
}

export class RenameKeysAdvanced implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Rename Keys Advanced',
		name: 'renameKeysAdvanced',
		icon: 'fa:edit',
		group: ['transform'],
		version: 1,
		description: 'Renames keys node with extra functionality',
		defaults: {
			name: 'Rename Keys Adanced',
			color: '#733bde',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: ['main','main'],
		inputNames: ['Data','Template'],
		outputs: ['main'],//Whether only the values set on this node should be kept and all others removed
		properties: [
			{
				displayName: 'Keep Only Renamed',
				name: 'keepOnlyRenamed',
				description: 'Whether only the values renamed on this node should be kept and all others removed',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Keys',
				name: 'keys',
				placeholder: 'Add new key',
				description: 'Adds a key which should be renamed',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				default: {},
				options: [
					{
						displayName: 'Key',
						name: 'key',
						values: [
							{
								displayName: 'Current Key Name',
								name: 'currentKey',
								type: 'string',
								default: '',
								placeholder: 'currentKey',
								description:
									'The current name of the key. It is also possible to define deep keys by using dot-notation like for example: "level1.level2.currentKey".',
							},
							{
								displayName: 'New Key Name',
								name: 'newKey',
								type: 'string',
								default: '',
								placeholder: 'newKey',
								description:
									'The name the key should be renamed to. It is also possible to define deep keys by using dot-notation like for example: "level1.level2.newKey".',
							},
						],
					},
				],
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				default: {},
				placeholder: 'Add Option',
				options: [
					{
						displayName: 'Template',
						name: 'template',
						placeholder: 'Add a Template',
						description: 'Adds a Template to be used for the renaming of keys',
						type: 'fixedCollection',
						default: {},
						options: [
							{
								displayName: 'Template',
								name: 'template',
								values: [
									{
										displayName: 'From',
										name: 'fieldFrom',
										description: 'Name of the field where the key names to rename are stored',
										type: 'string',
										placeholder: 'from',
										hint: 'The name of the field as text (e.g. “id”)',
										default:'',
									},
									{
										displayName: 'To',
										name: 'fieldTo',
										description: 'Name of the field where the renamed values are stored',
										type: 'string',
										placeholder: 'to',
										hint: 'The name of the field as text (e.g. “id”)',
										default:'',
									},
								]
							}
						]
					},
					{
						displayName: 'Regex',
						name: 'regexReplacement',
						placeholder: 'Add new regular expression',
						description: 'Adds a regular expressiond',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
							sortable: true,
						},
						default: {},
						options: [
							{
								displayName: 'Replacement',
								name: 'replacements',
								values: [
									{
										displayName:
											'Be aware that by using regular expression previously renamed keys can be affected',
										name: 'regExNotice',
										type: 'notice',
										default: '',
									},
									{
										displayName: 'Regular Expression',
										name: 'searchRegex',
										type: 'string',
										default: '',
										placeholder: 'e.g. [N-n]ame',
										description: 'Regex to match the key name',
										hint: 'Learn more and test RegEx <a href="https://regex101.com/">here</a>',
									},
									{
										displayName: 'Replace With',
										name: 'replaceRegex',
										type: 'string',
										default: '',
										placeholder: 'replacedName',
										description:
											"The name the key/s should be renamed to. It's possible to use regex captures e.g. $1, $2, ...",
									},
									{
										displayName: 'Options',
										name: 'options',
										type: 'collection',
										default: {},
										placeholder: 'Add Regex Option',
										options: [
											{
												displayName: 'Case Insensitive',
												name: 'caseInsensitive',
												type: 'boolean',
												description: 'Whether to use case insensitive match',
												default: false,
											},
											{
												displayName: 'Max Depth',
												name: 'depth',
												type: 'number',
												default: -1,
												description: 'Maximum depth to replace keys',
												hint: 'Specify number for depth level (-1 for unlimited, 0 for top level only)',
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items:INodeExecutionData[] = this.getInputData(0);
		const template:INodeExecutionData[] = this.getInputData(1);

		const keepOnlyRenamed = this.getNodeParameter('keepOnlyRenamed', 0, false) as boolean;
		const returnData: INodeExecutionData[] = [];

		let item: INodeExecutionData;
		let newItem: INodeExecutionData;
		let renameKeys: IRenameKey[];
		let value: any; // tslint:disable-line:no-any
		let renamedKeys:string[] =[];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			renameKeys = this.getNodeParameter('keys.key', itemIndex, []) as IRenameKey[];

			if(keepOnlyRenamed===true){
				renamedKeys = renameKeys.map(({newKey})=>newKey);
			}

			const regexReplacements = this.getNodeParameter(
				'additionalOptions.regexReplacement.replacements',
				itemIndex,
				[],
			) as IDataObject[];

			item = items[itemIndex];

			// Copy the whole JSON data as data on any level can be renamed
			newItem = {
				json: JSON.parse(JSON.stringify(item.json)),
				pairedItem: {
					item: itemIndex,
				},
			};

			if (item.binary !== undefined) {
				// Reference binary data if any exists. We can reference it
				// as this nodes does not change it
				newItem.binary = item.binary;
			}

			const renameKeysTemplateFrom = this.getNodeParameter('additionalOptions.template.template.fieldFrom', itemIndex, '') as string;
			const renameKeysTemplateTo = this.getNodeParameter('additionalOptions.template.template.fieldTo', itemIndex, '') as string;
			if(renameKeysTemplateFrom!==''&& renameKeysTemplateTo!==''){
				const renameKeysTemplate: IRenameKey[] = template.map((item)=> {
					return {currentKey:item.json[renameKeysTemplateFrom], newKey:item.json[renameKeysTemplateTo]} as IRenameKey;
				});
				renameKeysTemplate.forEach((renameKey) => {
					if (
						renameKey.currentKey === '' ||
						renameKey.newKey === '' ||
						renameKey.currentKey === renameKey.newKey
					) {
						// Ignore all which do not have all the values set or if the new key is equal to the current key
						return;
					}
					value = get(item.json, renameKey.currentKey as string);
					if (value === undefined) {
						return;
					}
					set(newItem.json, renameKey.newKey, value);

					unset(newItem.json, renameKey.currentKey as string);
				});

				if(keepOnlyRenamed===true){
					renamedKeys = renamedKeys.concat.apply(renamedKeys,renameKeysTemplate.map(({currentKey,newKey})=>newKey));
				}
			}

			renameKeys.forEach((renameKey) => {
				if (
					renameKey.currentKey === '' ||
					renameKey.newKey === '' ||
					renameKey.currentKey === renameKey.newKey
				) {
					// Ignore all which do not have all the values set or if the new key is equal to the current key
					return;
				}
				value = get(item.json, renameKey.currentKey as string);
				if (value === undefined) {
					return;
				}
				set(newItem.json, renameKey.newKey, value);

				unset(newItem.json, renameKey.currentKey as string);
			});

			regexReplacements.forEach((replacement) => {
				const { searchRegex, replaceRegex, options } = replacement;
				const { depth, caseInsensitive } = options as IDataObject;

				const flags = (caseInsensitive as boolean) ? 'i' : undefined;

				const regex = new RegExp(searchRegex as string, flags);

				const renameObjectKeys = (obj: IDataObject, depth: number) => {
					for (const key in obj) {
						if (Array.isArray(obj)) {
							// Don't rename array object references
							if (depth !== 0) {
								renameObjectKeys(obj[key] as IDataObject, depth - 1);
							}
						} else if (obj.hasOwnProperty(key)) {
							if (typeof obj[key] === 'object' && depth !== 0) {
								renameObjectKeys(obj[key] as IDataObject, depth - 1);
							}
							if (key.match(regex)) {
								const newKey = key.replace(regex, replaceRegex as string);

								if(keepOnlyRenamed){
									renamedKeys.push(newKey);
								}

								if (newKey !== key) {
									obj[newKey] = obj[key];
									delete obj[key];
								}

							}
						}
					}
					return obj;
				};
				newItem.json = renameObjectKeys(newItem.json, depth as number);
			});

			if(keepOnlyRenamed){
				newItem.json = pick(newItem.json,renamedKeys);
			}

			returnData.push(newItem);
		}

		return [returnData];
	}
}
